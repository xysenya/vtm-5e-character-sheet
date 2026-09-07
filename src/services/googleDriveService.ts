import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { CharacterSheet } from '../types';
import { parseCharacterJson } from '../utils/characterJson';

// Initialize Firebase App singleton safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request strictly the drive.file scope (per user requirement and OAuth setup)
provider.addScope('https://www.googleapis.com/auth/drive.file');

const SESSION_TOKEN_KEY = 'vtm_gdrive_tab_session_token';

let isSigningIn = false;
// In-memory token cache with tab-session persistence (strictly sessionStorage, never localStorage)
let cachedAccessToken: string | null = null;

export const FOLDER_NAME = 'VtM5eSheet';
const FOLDER_ID_STORAGE_KEY = 'vtm_gdrive_folder_id';

let cachedFolderId: string | null = null;
let activeFolderPromise: Promise<string> | null = null;

export interface DriveCharacterFile {
  id: string;
  name: string;
  modifiedTime?: string;
  createdTime?: string;
  size?: string;
  parents?: string[];
  summary?: {
    name: string;
    clan?: string;
    generation?: number;
    concept?: string;
    portraitUrl?: string;
  } | null;
  loadedSheet?: CharacterSheet | null;
}

/**
 * Get current access token from memory or active tab session
 */
export const getCachedAccessToken = (): string | null => {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    const sessionToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (sessionToken) {
      cachedAccessToken = sessionToken;
      return sessionToken;
    }
  } catch {
    // sessionStorage not available
  }
  return null;
};

/**
 * Set cached access token in memory and tab session
 */
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  try {
    if (token) {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    }
  } catch {
    // sessionStorage not available
  }
};

/**
 * Get known folder ID from memory or localStorage
 */
export const getCachedFolderId = (): string | null => {
  if (cachedFolderId) return cachedFolderId;
  try {
    const stored = localStorage.getItem(FOLDER_ID_STORAGE_KEY);
    if (stored) {
      cachedFolderId = stored;
      return stored;
    }
  } catch {}
  return null;
};

/**
 * Set known folder ID in memory and localStorage
 */
export const setCachedFolderId = (folderId: string | null) => {
  cachedFolderId = folderId;
  try {
    if (folderId) {
      localStorage.setItem(FOLDER_ID_STORAGE_KEY, folderId);
    } else {
      localStorage.removeItem(FOLDER_ID_STORAGE_KEY);
    }
  } catch {}
};

/**
 * Initialize Google Auth State Listener
 */
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthSignedOut?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const token = getCachedAccessToken();
      if (onAuthSuccess) {
        onAuthSuccess(user, token);
      }
    } else {
      setCachedAccessToken(null);
      if (onAuthSignedOut) {
        onAuthSignedOut();
      }
    }
  });
};

/**
 * Perform Google Sign-In with popup
 */
export const loginWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  if (isSigningIn) {
    throw new Error('Авторизация уже выполняется. Пожалуйста, подождите.');
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Не удалось получить токен доступа Google Drive.');
    }

    setCachedAccessToken(credential.accessToken);
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out from Google Auth
 */
export const logoutGoogle = async () => {
  await signOut(auth);
  setCachedAccessToken(null);
  setCachedFolderId(null);
};

/**
 * Helper to handle Google Drive API errors, detecting token expiration
 */
const handleDriveApiError = async (res: Response, defaultMessage: string) => {
  if (res.status === 401) {
    setCachedAccessToken(null);
    throw new Error('Срок действия сессии Google Диска истек. Пожалуйста, нажмите «Подключить Google Диск» заново.');
  }
  const errText = await res.text();
  throw new Error(`${defaultMessage} (${res.status}): ${errText}`);
};

/**
 * Verify if a specific folder ID is valid, named 'VtM5eSheet', and not trashed
 */
export const verifyFolderExists = async (accessToken: string, folderId: string): Promise<boolean> => {
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,mimeType,trashed`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return (
      data.id === folderId &&
      data.name === FOLDER_NAME &&
      data.mimeType === 'application/vnd.google-apps.folder' &&
      !data.trashed
    );
  } catch {
    return false;
  }
};

/**
 * Get all files inside a specific folder
 */
export const getFilesInFolder = async (
  accessToken: string,
  folderId: string
): Promise<Array<{ id: string; name: string }>> => {
  try {
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&pageSize=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch {
    return [];
  }
};

/**
 * Find all folders named 'VtM5eSheet' on the user's Google Drive
 */
export const findAllVtMFolders = async (
  accessToken: string
): Promise<Array<{ id: string; name: string; modifiedTime?: string; createdTime?: string }>> => {
  try {
    const query = encodeURIComponent(
      `mimeType = 'application/vnd.google-apps.folder' and name = '${FOLDER_NAME}' and trashed = false`
    );
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,createdTime)&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!res.ok) {
      if (res.status === 401) setCachedAccessToken(null);
      return [];
    }
    const data = await res.json();
    return data.files || [];
  } catch (e) {
    console.warn('Error querying VtM5eSheet folders:', e);
    return [];
  }
};

/**
 * Consolidate multiple duplicate 'VtM5eSheet' folders into a single canonical folder.
 * Moves any character files from duplicate folders into the primary folder,
 * and deletes/trashes duplicate folders so only ONE folder remains on the user's Drive.
 */
export const consolidateVtMFolders = async (
  accessToken: string,
  folders: Array<{ id: string; name: string; modifiedTime?: string; createdTime?: string }>
): Promise<string> => {
  if (folders.length === 0) {
    throw new Error('Нет папок для консолидации.');
  }
  if (folders.length === 1) {
    return folders[0].id;
  }

  console.info(`[VtM5eSheet] Found ${folders.length} folders named '${FOLDER_NAME}'. Consolidating into one...`);

  // 1. Inspect all folders to count their files
  const folderStats: Array<{
    folder: { id: string; name: string; modifiedTime?: string; createdTime?: string };
    files: Array<{ id: string; name: string }>;
  }> = [];

  for (const folder of folders) {
    const files = await getFilesInFolder(accessToken, folder.id);
    folderStats.push({ folder, files });
  }

  // 2. Select the canonical primary folder:
  // Prefer folder with the most files; if tied, prefer the earliest created original folder.
  folderStats.sort((a, b) => {
    if (b.files.length !== a.files.length) {
      return b.files.length - a.files.length;
    }
    const timeA = a.folder.createdTime || a.folder.modifiedTime || '';
    const timeB = b.folder.createdTime || b.folder.modifiedTime || '';
    return timeA.localeCompare(timeB);
  });

  const primary = folderStats[0];
  const primaryFolderId = primary.folder.id;
  const duplicates = folderStats.slice(1);

  // 3. For each duplicate folder: move its files into primaryFolderId, then delete/trash the duplicate folder
  for (const dup of duplicates) {
    const dupId = dup.folder.id;

    // Move all files inside dup into primaryFolderId
    for (const file of dup.files) {
      try {
        await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?addParents=${primaryFolderId}&removeParents=${dupId}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          }
        );
        console.info(`[VtM5eSheet] Moved file '${file.name}' (${file.id}) to primary folder ${primaryFolderId}`);
      } catch (err) {
        console.warn(`Could not move file ${file.id} to primary folder ${primaryFolderId}:`, err);
      }
    }

    // Delete or trash the duplicate folder
    try {
      const delRes = await fetch(`https://www.googleapis.com/drive/v3/files/${dupId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!delRes.ok) {
        // If permanent DELETE is not allowed, move to trash
        await fetch(`https://www.googleapis.com/drive/v3/files/${dupId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trashed: true }),
        });
      }
      console.info(`[VtM5eSheet] Removed duplicate folder ${dupId}`);
    } catch (err) {
      console.warn(`Could not trash duplicate folder ${dupId}:`, err);
    }
  }

  setCachedFolderId(primaryFolderId);
  return primaryFolderId;
};

/**
 * Find or create the dedicated 'VtM5eSheet' folder on the user's Google Drive.
 * Enforces that STRICTLY ONE folder named 'VtM5eSheet' exists:
 * - Checks existing folders on Drive first.
 * - If already exists, uses the existing folder and NEVER creates duplicates.
 * - If multiple folders exist from prior sessions, consolidates all files into one primary folder
 *   and deletes the duplicate folders.
 * - Locks parallel executions with activeFolderPromise to prevent race-condition duplications.
 */
export const getOrCreateVtMFolder = async (accessToken: string): Promise<string> => {
  if (activeFolderPromise) {
    return activeFolderPromise;
  }

  activeFolderPromise = (async () => {
    try {
      // 1. Check if cached folder ID is still valid on Drive
      const cached = getCachedFolderId();
      if (cached) {
        const isValid = await verifyFolderExists(accessToken, cached);
        if (isValid) {
          // Verify in the background whether any duplicate folders exist and clean them up
          findAllVtMFolders(accessToken).then((all) => {
            if (all.length > 1) {
              consolidateVtMFolders(accessToken, all).catch((err) =>
                console.warn('Background folder consolidation error:', err)
              );
            }
          });
          return cached;
        } else {
          setCachedFolderId(null);
        }
      }

      // 2. Search Google Drive for any existing folders named 'VtM5eSheet'
      const existingFolders = await findAllVtMFolders(accessToken);

      // 3. Exactly one folder found — reuse it!
      if (existingFolders.length === 1) {
        const folderId = existingFolders[0].id;
        setCachedFolderId(folderId);
        return folderId;
      }

      // 4. Multiple duplicate folders found — consolidate into exactly ONE folder!
      if (existingFolders.length > 1) {
        const canonicalId = await consolidateVtMFolders(accessToken, existingFolders);
        setCachedFolderId(canonicalId);
        return canonicalId;
      }

      // 5. 0 folders found — only now create ONE folder
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
          description: 'Папка для интерактивных листов персонажей Vampire: The Masquerade 5e',
        }),
      });

      if (!createRes.ok) {
        await handleDriveApiError(createRes, 'Ошибка создания папки VtM5eSheet');
      }

      const newFolder = await createRes.json();
      setCachedFolderId(newFolder.id);
      return newFolder.id;
    } finally {
      activeFolderPromise = null;
    }
  })();

  return activeFolderPromise;
};

/**
 * List character files from Google Drive.
 * Searches across all VtM5eSheet folders as well as any JSON character files created by this app.
 */
export const listDriveCharacters = async (
  accessToken: string,
  preferredFolderId?: string
): Promise<DriveCharacterFile[]> => {
  // Query all non-folder, non-trashed files accessible to this app
  // Under drive.file scope, this is strictly limited to files created/opened by this app!
  const query = encodeURIComponent(`trashed = false and mimeType != 'application/vnd.google-apps.folder'`);
  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,createdTime,size,description,parents)&orderBy=modifiedTime desc`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!listRes.ok) {
    await handleDriveApiError(listRes, 'Не удалось загрузить список файлов с Google Диска');
  }

  const data = await listRes.json();
  const rawFiles: any[] = data.files || [];

  // Filter and process files: ensure only character sheet files are shown
  const files: DriveCharacterFile[] = [];

  for (const file of rawFiles) {
    // Check if it's a character JSON file or in one of our folders
    const isJsonName = file.name?.toLowerCase().endsWith('.json') || file.name?.toLowerCase().includes('vtm');
    let summary = null;

    if (file.description) {
      try {
        summary = JSON.parse(file.description);
      } catch {
        // description is plain text or other format
      }
    }

    // Include if it has a valid VtM summary OR has a JSON extension/name
    if (summary || isJsonName || file.parents?.includes(preferredFolderId || '')) {
      files.push({
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime,
        createdTime: file.createdTime,
        size: file.size,
        parents: file.parents,
        summary,
      });
    }
  }

  return files;
};

/**
 * Read and parse character sheet JSON from a Google Drive file
 */
export const fetchDriveCharacterContent = async (
  accessToken: string,
  fileId: string
): Promise<CharacterSheet> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ошибка чтения файла с Google Диска (${res.status}): ${errText}`);
  }

  const rawText = await res.text();
  const parsed = parseCharacterJson(rawText);
  if (!parsed.success || !parsed.character) {
    throw new Error(parsed.error || 'Файл не содержит корректных данных листа персонажа VtM5e.');
  }

  return parsed.character;
};

/**
 * Save character sheet to Google Drive (either create new or update existing)
 */
export const saveCharacterToDrive = async (
  accessToken: string,
  folderId: string,
  sheet: CharacterSheet,
  existingFileId?: string,
  customFileName?: string
): Promise<{ id: string; name: string }> => {
  const charName = sheet.info.name?.trim() || 'Безымянный Сородич';
  const defaultFileName = `${charName} - VtM5e.json`;
  const fileName = customFileName?.trim() || defaultFileName;

  const summary = {
    name: charName,
    clan: sheet.info.clan,
    generation: sheet.info.generation,
    concept: sheet.info.concept || '',
    portraitUrl: sheet.v5Bio?.portraitUrl || '',
    updatedAt: new Date().toISOString(),
  };

  const jsonContent = JSON.stringify(sheet, null, 2);

  if (existingFileId) {
    // 1. Update file content
    const uploadRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: jsonContent,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Ошибка обновления файла на Google Диске (${uploadRes.status}): ${errText}`);
    }

    // 2. Update metadata (description and name if specified)
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${existingFileId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fileName,
        description: JSON.stringify(summary),
      }),
    });

    if (!metaRes.ok) {
      console.warn('Could not update metadata for file', existingFileId);
    }

    return { id: existingFileId, name: fileName };
  } else {
    // Multipart create new file
    const metadata = {
      name: fileName,
      parents: [folderId],
      mimeType: 'application/json',
      description: JSON.stringify(summary),
    };

    const boundary = '-------vtm5esheetboundary' + Date.now();
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelim = `\r\n--${boundary}--`;

    const multipartBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      jsonContent +
      closeDelim;

    const createRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      }
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Ошибка создания файла на Google Диске (${createRes.status}): ${errText}`);
    }

    const newFileData = await createRes.json();
    return { id: newFileData.id, name: newFileData.name || fileName };
  }
};

/**
 * Permanently delete a character file from Google Drive
 */
export const deleteCharacterFromDrive = async (
  accessToken: string,
  fileId: string
): Promise<void> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Не удалось удалить файл с Google Диска (${res.status}): ${errText}`);
  }
};

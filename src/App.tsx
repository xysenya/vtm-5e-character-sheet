import React, { useState, useEffect } from 'react';
import {
  CharacterSheet,
  ClanId,
  DisciplineItem,
  BackgroundItem,
  MeritFlawItem,
  ExperienceLogItem,
  HealthLevel,
  TraitItem,
} from './types';
import { CLAN_THEMES } from './data/clans';
import { getGenerationInfo } from './utils/calculations';
import { createInitialCharacter } from './utils/defaultCharacter';

// Components
import { HeaderBar } from './components/HeaderBar';

// V5 5-Page Layout Components (PDF Breakdown)
import { SheetPage1 } from './components/v5/SheetPage1';
import { SheetPage2 } from './components/v5/SheetPage2';
import { SheetPage3 } from './components/v5/SheetPage3';
import { SheetPage4 } from './components/v5/SheetPage4';
import { SheetPage5 } from './components/v5/SheetPage5';

// Modals
import { FloatingDiceRoller } from './components/FloatingDiceRoller';
import { PrintModal } from './components/PrintModal';
import { CreationRulesModal } from './components/CreationRulesModal';
import { AlertModal } from './components/AlertModal';
import { ConfirmModal } from './components/ConfirmModal';
import { EasterEggEffects } from './components/EasterEggEffects';
import { NewCharacterModal } from './components/NewCharacterModal';
import { AppSettingsModal } from './components/AppSettingsModal';
import { TempPrintCalibrator, CalibrationState, loadSavedCalibration } from './components/v5/TempPrintCalibrator';
import { AppearanceCustomizer } from './components/v5/AppearanceCustomizer';
import {
  SheetColorSettings,
  loadSavedAppearanceColors,
  saveAppearanceColors,
} from './types/appearance';
import { exportCharacterToJson, parseCharacterJson } from './utils/characterJson';
import { CharacterImportModal } from './components/CharacterImportModal';
import { QuickJsonImportModal } from './components/QuickJsonImportModal';
import { User } from 'firebase/auth';
import {
  initGoogleAuth,
  loginWithGoogle,
  logoutGoogle,
  getOrCreateVtMFolder,
  listDriveCharacters,
  fetchDriveCharacterContent,
  saveCharacterToDrive,
  deleteCharacterFromDrive,
  getCachedAccessToken,
  getCachedFolderId,
  DriveCharacterFile,
} from './services/googleDriveService';
import { GoogleAuthModal } from './components/v5/GoogleAuthModal';
import { GoogleDriveSaveModal } from './components/v5/GoogleDriveSaveModal';
import { GoogleDriveManagerModal } from './components/v5/GoogleDriveManagerModal';


export default function App() {
  // Sheet state with offline localStorage persistence
  const [sheet, setSheet] = useState<CharacterSheet>(() => {
    try {
      const local = localStorage.getItem('vtm_v5_sheet');
      if (local) {
        return JSON.parse(local);
      }
      const savedCode = localStorage.getItem('vtm_sync_code');
      if (savedCode) {
        const oldLocal = localStorage.getItem(`vtm_sheet_${savedCode}`);
        if (oldLocal) {
          return JSON.parse(oldLocal);
        }
      }
    } catch (e) {
      console.warn('Failed to parse local sheet:', e);
    }
    return createInitialCharacter();
  });

  // Dynamic browser tab title: "[Имя персонажа] | VTM 5e - Лист персонажа"
  useEffect(() => {
    const charName = sheet.info?.name?.trim();
    if (charName) {
      document.title = `${charName} | VTM 5e - Лист персонажа`;
    } else {
      document.title = 'VTM 5e - Лист персонажа';
    }
  }, [sheet.info?.name]);

  // Print mode
  const [isInkSaver, setIsInkSaver] = useState<boolean>(false);

  // Active Page Navigation
  const [activePage, setActivePage] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vtm_theme_v2');
      if (saved) return saved === 'dark';
      return false; // Светлая тема сайта по умолчанию
    } catch {
      return false;
    }
  });

  // Character Sheet Theme state (separated from the site environment theme)
  const [isSheetDark, setIsSheetDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vtm_sheet_theme_v2');
      if (saved) return saved === 'dark';
      return false; // Светлая тема листа персонажа по умолчанию
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.remove('theme-light');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.body.classList.add('theme-light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    try {
      localStorage.setItem('vtm_theme', isDarkTheme ? 'dark' : 'light');
      localStorage.setItem('vtm_theme_v2', isDarkTheme ? 'dark' : 'light');
    } catch {}
  }, [isDarkTheme]);

  useEffect(() => {
    try {
      localStorage.setItem('vtm_sheet_theme', isSheetDark ? 'dark' : 'light');
      localStorage.setItem('vtm_sheet_theme_v2', isSheetDark ? 'dark' : 'light');
    } catch {}
  }, [isSheetDark]);

  // The sheet theme on-screen is strictly controlled by the user's selected sheet theme (isSheetDark).
  // When Ink Saver mode prints, the sheet is rendered with light theme layout (isDark = false) in pure black and white.
  const [isPrintingInkSaver, setIsPrintingInkSaver] = useState<boolean>(false);
  const effectiveSheetDark = isPrintingInkSaver ? false : isSheetDark;

  const [keepTextFieldsLight, setKeepTextFieldsLight] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vtm_print_keep_fields_light') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleKeepTextFieldsLight = (val: boolean) => {
    setKeepTextFieldsLight(val);
    try {
      localStorage.setItem('vtm_print_keep_fields_light', val ? 'true' : 'false');
    } catch {}
  };

  useEffect(() => {
    // Ensure clean state: print-ink-saver must never stay on the screen document
    document.body.classList.remove('print-ink-saver');
    document.documentElement.classList.remove('print-ink-saver');
    document.body.classList.remove('print-light-text-fields');
    document.documentElement.classList.remove('print-light-text-fields');
  }, []);

  // Modal open states
  const [showFloatingDice, setShowFloatingDice] = useState<boolean>(false);
  const [floatingDicePreset, setFloatingDicePreset] = useState<{
    pool?: number;
    title?: string;
  }>({});
  const [traitSelectionEvent, setTraitSelectionEvent] = useState<{
    name: string;
    value: number;
    id: number;
  } | null>(null);

  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showAppSettingsModal, setShowAppSettingsModal] = useState<boolean>(false);
  const [showCreationCalc, setShowCreationCalc] = useState<boolean>(false);

  // Print Calibration widget state (disabled by default)
  const [showPrintCalibrator, setShowPrintCalibrator] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vtm_show_print_calibrator') === 'true';
    } catch {
      return false;
    }
  });

  const handleTogglePrintCalibrator = (enabled: boolean) => {
    setShowPrintCalibrator(enabled);
    try {
      localStorage.setItem('vtm_show_print_calibrator', enabled ? 'true' : 'false');
    } catch {}
  };

  // Appearance Customizer widget state (disabled by default)
  const [showAppearanceCustomizer, setShowAppearanceCustomizer] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vtm_show_appearance_customizer') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleAppearanceCustomizer = (enabled: boolean) => {
    setShowAppearanceCustomizer(enabled);
    try {
      localStorage.setItem('vtm_show_appearance_customizer', enabled ? 'true' : 'false');
    } catch {}
  };

  // Custom sheet colors state
  const [customColors, setCustomColors] = useState<SheetColorSettings>(() => {
    return loadSavedAppearanceColors(effectiveSheetDark);
  });

  const handleToggleSheetTheme = () => {
    const nextDark = !effectiveSheetDark;
    setIsSheetDark(nextDark);
    try {
      localStorage.setItem('vtm_sheet_dark_theme', nextDark ? 'true' : 'false');
    } catch {}
    setCustomColors(loadSavedAppearanceColors(nextDark));
  };

  const handleUpdateCustomColors = (newColors: SheetColorSettings, targetThemeIsDark?: boolean) => {
    const isDark = typeof targetThemeIsDark === 'boolean' ? targetThemeIsDark : effectiveSheetDark;
    if (typeof targetThemeIsDark === 'boolean' && targetThemeIsDark !== effectiveSheetDark) {
      setIsSheetDark(targetThemeIsDark);
      try {
        localStorage.setItem('vtm_sheet_dark_theme', targetThemeIsDark ? 'true' : 'false');
      } catch {}
    }
    setCustomColors(newColors);
    saveAppearanceColors(isDark, newColors);
  };

  // Dynamic print and layout calibration dimensions (persisted and synced across UI & print)
  const [printCalibration, setPrintCalibration] = useState<CalibrationState>(loadSavedCalibration);
  const meritsRows = printCalibration.meritsRows;
  const bioHeight = printCalibration.bioHeight;
  const inventoryHeight = printCalibration.inventoryHeight;
  const notesHeight = 880;

  // Custom alert & confirm modal states (Replacing browser window.alert & window.confirm)
  const [isNewCharModalOpen, setIsNewCharModalOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // JSON Import & Export states
  const [importedCandidate, setImportedCandidate] = useState<CharacterSheet | null>(null);
  const [importSourceType, setImportSourceType] = useState<'file' | 'text'>('file');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showQuickJsonModal, setShowQuickJsonModal] = useState<boolean>(false);

  const showAlert = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  // JSON Export Handler
  const handleExportJson = () => {
    try {
      exportCharacterToJson(sheet);
    } catch (e: any) {
      showAlert(
        'Ошибка экспорта',
        `Не удалось сохранить файл: ${e?.message || 'Неизвестная ошибка'}`,
        'error'
      );
    }
  };

  // JSON File Import Handler
  const handleImportJsonFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text || !text.trim()) {
        showAlert('Ошибка чтения файла', 'Выбранный файл пуст.', 'error');
        return;
      }
      const parsed = parseCharacterJson(text);
      if (!parsed.success || !parsed.character) {
        showAlert(
          'Ошибка в файле JSON',
          parsed.error || 'Не удалось распознать персонажа.',
          'error'
        );
        return;
      }
      setImportedCandidate(parsed.character);
      setImportSourceType('file');
      setShowImportModal(true);
    };
    reader.onerror = () => {
      showAlert('Ошибка чтения', 'Не удалось прочитать содержимое файла.', 'error');
    };
    reader.readAsText(file);
  };

  // Quick JSON Array / AI Prompt text parsed Handler
  const handleQuickJsonParsed = (character: CharacterSheet) => {
    setImportedCandidate(character);
    setImportSourceType('text');
    setShowImportModal(true);
  };

  // Confirm Import Handler
  const handleConfirmImport = (candidate: CharacterSheet) => {
    setSheet(candidate);
    try {
      localStorage.setItem('vtm_v5_sheet', JSON.stringify(candidate));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    showAlert(
      'Персонаж успешно импортирован',
      `Персонаж "${candidate.info.name || 'Безымянный'}" (${candidate.info.clan}) загружен в бланк. Все характеристики, навыки и дисциплины обновлены.`,
      'success'
    );
  };

  // Google Drive & Auth State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [googleFolderId, setGoogleFolderId] = useState<string | null>(() => getCachedFolderId());
  const [driveFiles, setDriveFiles] = useState<DriveCharacterFile[]>([]);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState<boolean>(false);
  const [isSyncingWithDrive, setIsSyncingWithDrive] = useState<boolean>(false);

  // Active loaded file on Google Drive (for instant real-time autosave)
  const [activeDriveFile, setActiveDriveFile] = useState<{ id: string; name: string } | null>(() => {
    try {
      const saved = localStorage.getItem('vtm_active_drive_file');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Modal open states for Google Drive
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState<boolean>(false);
  const [showGoogleDriveManager, setShowGoogleDriveManager] = useState<boolean>(false);
  const [showGoogleSaveModal, setShowGoogleSaveModal] = useState<boolean>(false);

  // Refresh or load Drive files list
  const loadDriveFilesList = async (token?: string | null, folderId?: string | null) => {
    const useToken = token || googleAccessToken || getCachedAccessToken();
    if (!useToken) return;
    const useFolder = folderId || googleFolderId || getCachedFolderId();
    setIsLoadingDriveFiles(true);
    try {
      const files = await listDriveCharacters(useToken, useFolder || undefined);
      setDriveFiles(files);
      // Ensure the single canonical folder is determined and cached
      if (!googleFolderId) {
        getOrCreateVtMFolder(useToken)
          .then((fId) => setGoogleFolderId(fId))
          .catch((e) => console.warn('Background folder resolution error:', e));
      }
    } catch (err: any) {
      console.error('Failed to list drive files:', err);
      if (err?.message?.includes('истек') || err?.message?.includes('401')) {
        setGoogleAccessToken(null);
      }
    } finally {
      setIsLoadingDriveFiles(false);
    }
  };

  // Initialize Google Auth on mount
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      async (user, token) => {
        setGoogleUser(user);
        const effectiveToken = token || getCachedAccessToken();
        if (effectiveToken) {
          setGoogleAccessToken(effectiveToken);
          try {
            const folderId = await getOrCreateVtMFolder(effectiveToken);
            setGoogleFolderId(folderId);
            await loadDriveFilesList(effectiveToken, folderId);
          } catch (err: any) {
            console.error('Error getting VtM5eSheet folder on init:', err);
            // Even if folder call fails or has delay, still list all files!
            await loadDriveFilesList(effectiveToken);
          }
        }
      },
      () => {
        setGoogleUser(null);
        setGoogleAccessToken(null);
        setGoogleFolderId(null);
        setDriveFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  // Authorize Google Account
  const handleAuthorizeGoogle = async () => {
    try {
      const result = await loginWithGoogle();
      if (result) {
        setGoogleUser(result.user);
        setGoogleAccessToken(result.accessToken);
        try {
          const folderId = await getOrCreateVtMFolder(result.accessToken);
          setGoogleFolderId(folderId);
          await loadDriveFilesList(result.accessToken, folderId);
        } catch (err) {
          console.error('Error in post-auth folder setup:', err);
          await loadDriveFilesList(result.accessToken);
        }
        setShowGoogleAuthModal(false);
        showAlert(
          'Google Диск подключен',
          `Добро пожаловать, ${result.user.displayName || 'Сородич'}! Папка VtM5eSheet на Google Диске готова для хранения и синхронизации Ваших персонажей.`,
          'success'
        );
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      showAlert('Ошибка подключения', err?.message || 'Не удалось подключиться к Google Диску.', 'error');
    }
  };

  // Logout Google Account
  const handleLogoutGoogle = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleAccessToken(null);
    setGoogleFolderId(null);
    setDriveFiles([]);
    setActiveDriveFile(null);
    try {
      localStorage.removeItem('vtm_active_drive_file');
    } catch {}
    showAlert('Выход из аккаунта', 'Вы успешно вышли из Google Диска.', 'info');
  };

  // Load a character from Google Drive
  const handleLoadDriveCharacter = async (file: DriveCharacterFile) => {
    const token = googleAccessToken || getCachedAccessToken();
    if (!token) {
      showAlert('Требуется авторизация', 'Пожалуйста, подключитесь к Google Диску заново.', 'warning');
      return;
    }
    if (!googleAccessToken) {
      setGoogleAccessToken(token);
    }
    try {
      const loadedSheet = await fetchDriveCharacterContent(token, file.id);
      setSheet(loadedSheet);
      const activeInfo = { id: file.id, name: file.name };
      setActiveDriveFile(activeInfo);
      try {
        localStorage.setItem('vtm_active_drive_file', JSON.stringify(activeInfo));
        localStorage.setItem('vtm_v5_sheet', JSON.stringify(loadedSheet));
      } catch {}
      showAlert(
        'Персонаж загружен',
        `Персонаж «${loadedSheet.info.name || 'Безымянный'}» загружен для игры из файла «${file.name}». Все изменения будут автоматически сохраняться в этот файл на Google Диске!`,
        'success'
      );
    } catch (err: any) {
      showAlert('Ошибка загрузки', err?.message || 'Не удалось загрузить лист персонажа с Google Диска.', 'error');
    }
  };

  // Delete a character file from Google Drive
  const handleDeleteDriveCharacter = (file: DriveCharacterFile) => {
    showConfirm(
      'Удаление персонажа с Google Диска',
      `Вы действительно хотите удалить файл «${file.name}» из папки VtM5eSheet? Это действие необратимо.`,
      async () => {
        const token = googleAccessToken || getCachedAccessToken();
        if (!token) return;
        try {
          await deleteCharacterFromDrive(token, file.id);
          if (activeDriveFile?.id === file.id) {
            setActiveDriveFile(null);
            try {
              localStorage.removeItem('vtm_active_drive_file');
            } catch {}
          }
          await loadDriveFilesList(token);
          showAlert('Файл удален', `Персонаж «${file.name}» успешно удален с Google Диска.`, 'info');
        } catch (err: any) {
          showAlert('Ошибка удаления', err?.message || 'Не удалось удалить файл с Google Диска.', 'error');
        }
      }
    );
  };

  // Detach active file from Google Drive
  const handleDetachActiveFile = () => {
    setActiveDriveFile(null);
    try {
      localStorage.removeItem('vtm_active_drive_file');
    } catch {}
    showAlert(
      'Синхронизация отключена',
      'Текущий лист персонажа отвязан от файла на Google Диске. Вы можете продолжить редактирование локально.',
      'info'
    );
  };

  // Save character sheet to Google Drive (from Save Modal)
  const handleSaveToDrive = async ({
    isNewFile,
    customFileName,
  }: {
    isNewFile: boolean;
    customFileName?: string;
  }) => {
    const token = googleAccessToken || getCachedAccessToken();
    if (!token) {
      throw new Error('Google Диск не подключен. Пожалуйста, подтвердите авторизацию.');
    }
    if (!googleAccessToken) {
      setGoogleAccessToken(token);
    }
    let folderId = googleFolderId;
    if (!folderId) {
      folderId = await getOrCreateVtMFolder(token);
      setGoogleFolderId(folderId);
    }
    const targetFileId = isNewFile ? undefined : activeDriveFile?.id;
    const result = await saveCharacterToDrive(
      token,
      folderId,
      sheet,
      targetFileId,
      customFileName
    );
    const updatedActive = { id: result.id, name: result.name };
    setActiveDriveFile(updatedActive);
    try {
      localStorage.setItem('vtm_active_drive_file', JSON.stringify(updatedActive));
    } catch {}
    await loadDriveFilesList(token, folderId);
    showAlert(
      'Сохранено на Google Диск',
      `Лист персонажа «${sheet.info.name || 'Безымянный'}» сохранен в файл «${result.name}» в папке VtM5eSheet! Все дальнейшие изменения будут моментально обновляться на Диске.`,
      'success'
    );
  };

  // Instant real-time autosave to Google Drive when activeDriveFile is connected
  useEffect(() => {
    const token = googleAccessToken || getCachedAccessToken();
    if (!activeDriveFile || !token || !googleFolderId) return;

    const timer = setTimeout(async () => {
      try {
        setIsSyncingWithDrive(true);
        await saveCharacterToDrive(
          token,
          googleFolderId,
          sheet,
          activeDriveFile.id,
          activeDriveFile.name
        );
      } catch (err) {
        console.error('Real-time autosave to Google Drive failed:', err);
      } finally {
        setIsSyncingWithDrive(false);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [sheet, activeDriveFile, googleAccessToken, googleFolderId]);

  // Clan Theme calculation
  const clanTheme = CLAN_THEMES[sheet.info.clan] || CLAN_THEMES.brujah;
  const activeAccentColor = sheet.customTheme?.accentColor || clanTheme.accentColor;
  const genInfo = getGenerationInfo(sheet.info.generation);

  // Save to LocalStorage whenever sheet changes
  useEffect(() => {
    try {
      localStorage.setItem('vtm_v5_sheet', JSON.stringify(sheet));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [sheet]);

  // Reset / New Character - Opens rich V5 creation modal
  const handleResetCharacter = () => {
    setIsNewCharModalOpen(true);
  };

  const handleConfirmNewCharacter = (newChar: CharacterSheet, isBlank = false) => {
    setSheet(newChar);
    setActiveDriveFile(null);
    try {
      localStorage.removeItem('vtm_active_drive_file');
      localStorage.setItem('vtm_v5_sheet', JSON.stringify(newChar));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    setIsNewCharModalOpen(false);
    if (isBlank) {
      showAlert(
        'Чистый бланк создан',
        'Создан абсолютно чистый лист персонажа. Все поля, характеристики и способности готовы для заполнения с нуля!',
        'success'
      );
    } else {
      showAlert(
        'Новый Сородич создан',
        `Персонаж ${newChar.info.name || 'без имени'} (${CLAN_THEMES[newChar.info.clan]?.name || newChar.info.clan}) успешно создан по официальным правилам V5!`,
        'success'
      );
    }
  };

  const handleIncreaseHunger = () => {
    setSheet((prev) => {
      const currentHunger = prev.v5Tracks?.hunger ?? 1;
      return {
        ...prev,
        v5Tracks: {
          ...(prev.v5Tracks || {
            health: { max: 7, superficial: 0, aggravated: 0 },
            willpower: { max: 5, superficial: 0, aggravated: 0 },
            humanity: { value: 7, stains: 0 },
            hunger: 1,
          }),
          hunger: Math.min(5, currentHunger + 1),
        },
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleSpendWillpower = (): boolean => {
    const composureVal = sheet.attributes?.social?.composure?.value ?? 1;
    const resolveVal = sheet.attributes?.mental?.resolve?.value ?? 1;
    const activeMax = sheet.v5Tracks?.willpower?.max || (composureVal + resolveVal) || 5;

    const currentWp = sheet.v5Tracks?.willpower || {
      max: activeMax,
      superficial: 0,
      aggravated: 0,
    };

    const totalBoxes = 10;
    const curBoxes: ('empty' | 'superficial' | 'aggravated')[] =
      currentWp.boxes && currentWp.boxes.length === totalBoxes
        ? [...currentWp.boxes]
        : Array.from({ length: totalBoxes }, (_, i) =>
            i < currentWp.aggravated
              ? 'aggravated'
              : i < currentWp.aggravated + currentWp.superficial
              ? 'superficial'
              : 'empty'
          );

    const aggCount = curBoxes.filter((b, idx) => idx < activeMax && b === 'aggravated').length;
    if (aggCount >= activeMax) {
      return false;
    }

    setSheet((prev) => {
      const prevWp = prev.v5Tracks?.willpower || {
        max: activeMax,
        superficial: 0,
        aggravated: 0,
      };

      const boxes: ('empty' | 'superficial' | 'aggravated')[] =
        prevWp.boxes && prevWp.boxes.length === totalBoxes
          ? [...prevWp.boxes]
          : Array.from({ length: totalBoxes }, (_, i) =>
              i < prevWp.aggravated
                ? 'aggravated'
                : i < prevWp.aggravated + prevWp.superficial
                ? 'superficial'
                : 'empty'
            );

      const emptyIdx = boxes.findIndex((b, idx) => idx < activeMax && b === 'empty');
      if (emptyIdx !== -1) {
        boxes[emptyIdx] = 'superficial';
      } else {
        const supIdx = boxes.findIndex((b, idx) => idx < activeMax && b === 'superficial');
        if (supIdx !== -1) {
          boxes[supIdx] = 'aggravated';
        }
      }

      const newSup = boxes.filter((b, idx) => idx < activeMax && b === 'superficial').length;
      const newAgg = boxes.filter((b, idx) => idx < activeMax && b === 'aggravated').length;

      return {
        ...prev,
        v5Tracks: {
          ...(prev.v5Tracks || {
            health: { max: 7, superficial: 0, aggravated: 0 },
            humanity: { value: 7, stains: 0 },
            hunger: 1,
          }),
          willpower: {
            ...prevWp,
            max: activeMax,
            superficial: newSup,
            aggravated: newAgg,
            boxes,
          },
        },
        willpower: prev.willpower
          ? { ...prev.willpower, current: Math.max(0, prev.willpower.current - 1) }
          : prev.willpower,
        updatedAt: new Date().toISOString(),
      };
    });

    return true;
  };

  return (
    <div
      className={`min-h-screen pb-16 transition-colors ${
        isDarkTheme
          ? 'bg-[#0a0a0a] text-[#d1d1d1] selection:bg-red-900 selection:text-white'
          : 'bg-[#faf8f5] text-zinc-900 selection:bg-red-200 selection:text-red-950'
      }`}
    >
      {/* Fixed Navigation Bar */}
      <HeaderBar
        sheet={sheet}
        theme={clanTheme}
        activePage={activePage}
        onChangePage={setActivePage}
        isDark={isDarkTheme}
        onOpenPrint={() => setShowPrintModal(true)}
        onOpenSettings={() => setShowAppSettingsModal(true)}
        onOpenCreationCalc={() => setShowCreationCalc(true)}
        onResetCharacter={handleResetCharacter}
        onExportJson={handleExportJson}
        onImportJsonFile={handleImportJsonFile}
        onOpenQuickJsonImport={() => setShowQuickJsonModal(true)}
        googleUser={googleUser}
        hasGoogleToken={!!(googleAccessToken || getCachedAccessToken())}
        onOpenGoogleAuth={() => setShowGoogleAuthModal(true)}
        onOpenGoogleDriveManager={() => {
          setShowGoogleDriveManager(true);
          const token = googleAccessToken || getCachedAccessToken();
          if (token) {
            if (!googleAccessToken) setGoogleAccessToken(token);
            loadDriveFilesList(token);
          }
        }}
        isSyncingWithDrive={isSyncingWithDrive}
        activeDriveFileName={activeDriveFile?.name}
      />

      {/* Main Character Sheet Content Container (V5 Interactive PDF Pages) */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 pt-6 space-y-8 print:p-0 print:m-0 print:pt-0 print:space-y-0">
        {activePage === 'all' ? (
          <div className="space-y-12 print:space-y-0">
            <SheetPage1
              sheet={sheet}
              onChange={setSheet}
              onOpenDiceRoller={(pool, label) => {
                setFloatingDicePreset({ pool, title: label });
                setTraitSelectionEvent({ name: label, value: pool, id: Date.now() });
                setShowFloatingDice(true);
              }}
              isDark={effectiveSheetDark}
              onToggleTheme={handleToggleSheetTheme}
            />
            <SheetPage2
              sheet={sheet}
              onChange={setSheet}
              isDark={effectiveSheetDark}
              meritsRows={meritsRows}
            />
            <SheetPage3
              sheet={sheet}
              onChange={setSheet}
              onShowAlert={showAlert}
              isDark={effectiveSheetDark}
              bioHeight={bioHeight}
              inventoryHeight={inventoryHeight}
            />
            <SheetPage4
              sheet={sheet}
              onChange={setSheet}
              isDark={effectiveSheetDark}
              notesHeight={notesHeight}
            />
            <SheetPage5 isDark={effectiveSheetDark} />
          </div>
        ) : activePage === 1 ? (
          <SheetPage1
            sheet={sheet}
            onChange={setSheet}
            onOpenDiceRoller={(pool, label) => {
              setFloatingDicePreset({ pool, title: label });
              setTraitSelectionEvent({ name: label, value: pool, id: Date.now() });
              setShowFloatingDice(true);
            }}
            isDark={effectiveSheetDark}
            onToggleTheme={handleToggleSheetTheme}
          />
        ) : activePage === 2 ? (
          <SheetPage2
            sheet={sheet}
            onChange={setSheet}
            isDark={effectiveSheetDark}
            meritsRows={meritsRows}
          />
        ) : activePage === 3 ? (
          <SheetPage3
            sheet={sheet}
            onChange={setSheet}
            onShowAlert={showAlert}
            isDark={effectiveSheetDark}
            bioHeight={bioHeight}
            inventoryHeight={inventoryHeight}
          />
        ) : activePage === 4 ? (
          <SheetPage4
            sheet={sheet}
            onChange={setSheet}
            isDark={effectiveSheetDark}
            notesHeight={notesHeight}
          />
        ) : (
          <SheetPage5 isDark={effectiveSheetDark} />
        )}
      </main>

      {/* Footer / Dark Pack Agreement Notice */}
      <footer className={`max-w-4xl mx-auto px-4 sm:px-6 mt-16 mb-8 pt-6 border-t no-print transition-colors ${
        isDarkTheme
          ? 'border-red-950/40 text-zinc-400'
          : 'border-zinc-200 text-zinc-600'
      }`}>
        <div className="text-center space-y-2 text-xs leading-relaxed">
          <p>
            Проект создан в соответствии с условиями программы The Dark Pack и использует материалы World of Darkness с разрешения Paradox Interactive AB.
          </p>
          <p>
            Portions of the materials are the copyrights and trademarks of Paradox Interactive AB, and are used with permission. All rights reserved.
          </p>
          <p>
            For more information please visit{' '}
            <a
              href="https://worldofdarkness.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 underline underline-offset-2 transition-colors font-medium"
            >
              worldofdarkness.com
            </a>
          </p>
          <p className="pt-1">
            Отдельное спасибо проекту{' '}
            <a
              href="https://vtm-5.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 underline underline-offset-2 transition-colors font-medium"
            >
              Kindred Codex
            </a>{' '}
            за материалы, использованные при создании проекта.
          </p>
          <p className="text-[11px] opacity-80 pt-1">
            This project is an unofficial World of Darkness fan project created under the Dark Pack Agreement.
          </p>
        </div>

        {/* Easter Egg under disclaimer */}
        <EasterEggEffects isDark={isDarkTheme} />
      </footer>

      {/* --- ALL POPUP MODALS (NO BROWSER ALERTS) --- */}

      {/* 2. Print & PDF Modal */}
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        sheet={sheet}
        isSheetDark={isSheetDark}
        isInkSaver={isInkSaver}
        onToggleInkSaver={(val) => setIsInkSaver(val)}
        keepTextFieldsLight={keepTextFieldsLight}
        onToggleKeepTextFieldsLight={handleToggleKeepTextFieldsLight}
        onBeforePrint={() => {
          if (isInkSaver) {
            setIsPrintingInkSaver(true);
          }
        }}
        onAfterPrint={() => {
          setIsPrintingInkSaver(false);
        }}
      />

      {/* 3. Creation Points Audit Modal */}
      <CreationRulesModal
        isOpen={showCreationCalc}
        onClose={() => setShowCreationCalc(false)}
        sheet={sheet}
      />

      {/* 4. New Character V5 Creation Modal */}
      <NewCharacterModal
        isOpen={isNewCharModalOpen}
        onClose={() => setIsNewCharModalOpen(false)}
        onConfirm={handleConfirmNewCharacter}
      />

      {/* 5. App Settings Modal */}
      <AppSettingsModal
        isOpen={showAppSettingsModal}
        onClose={() => setShowAppSettingsModal(false)}
        isDarkTheme={isDarkTheme}
        onToggleDarkTheme={(val) => setIsDarkTheme(val)}
        isSheetDark={isSheetDark}
        onToggleSheetDark={(val) => setIsSheetDark(val)}
        showPrintCalibrator={showPrintCalibrator}
        onTogglePrintCalibrator={handleTogglePrintCalibrator}
        showAppearanceCustomizer={showAppearanceCustomizer}
        onToggleAppearanceCustomizer={handleToggleAppearanceCustomizer}
      />

      {/* 6. Character Import Confirmation Modal (brief info & confirm) */}
      <CharacterImportModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportedCandidate(null);
        }}
        onConfirm={handleConfirmImport}
        character={importedCandidate}
        sourceType={importSourceType}
      />

      {/* 7. Quick JSON Array / AI Prompt Modal */}
      <QuickJsonImportModal
        isOpen={showQuickJsonModal}
        onClose={() => setShowQuickJsonModal(false)}
        onSuccessParsed={handleQuickJsonParsed}
      />

      {/* 8. Google Drive Auth Modal */}
      <GoogleAuthModal
        isOpen={showGoogleAuthModal}
        onClose={() => setShowGoogleAuthModal(false)}
        onAuthorize={handleAuthorizeGoogle}
        isDark={isDarkTheme}
      />

      {/* 9. Google Drive Save Character Modal */}
      <GoogleDriveSaveModal
        isOpen={showGoogleSaveModal}
        onClose={() => setShowGoogleSaveModal(false)}
        sheet={sheet}
        activeDriveFile={activeDriveFile}
        onSave={handleSaveToDrive}
        isDark={isDarkTheme}
      />

      {/* 10. Google Drive Character Manager Modal */}
      {googleUser && (
        <GoogleDriveManagerModal
          isOpen={showGoogleDriveManager}
          onClose={() => setShowGoogleDriveManager(false)}
          user={googleUser}
          onLogout={handleLogoutGoogle}
          files={driveFiles}
          isLoadingFiles={isLoadingDriveFiles}
          onRefreshFiles={loadDriveFilesList}
          activeFile={activeDriveFile}
          onLoadCharacter={handleLoadDriveCharacter}
          onDeleteCharacter={handleDeleteDriveCharacter}
          onDetachActiveFile={handleDetachActiveFile}
          onOpenSaveModal={() => {
            setShowGoogleDriveManager(false);
            setShowGoogleSaveModal(true);
          }}
          hasToken={!!(googleAccessToken || getCachedAccessToken())}
          onReauthorize={handleAuthorizeGoogle}
          isDark={isDarkTheme}
        />
      )}

      {/* Custom Alert Modal (replaces window.alert) */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />

      {/* Custom Confirm Modal (replaces window.confirm) */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText="Продолжить"
        cancelText="Отмена"
      />

      {/* Floating Dice Roller (Round button at bottom-right + dice window + history window) */}
      <FloatingDiceRoller
        sheet={sheet}
        isOpen={showFloatingDice}
        onToggle={() => setShowFloatingDice((prev) => !prev)}
        onClose={() => setShowFloatingDice(false)}
        presetPool={floatingDicePreset.pool}
        presetLabel={floatingDicePreset.title}
        traitSelectionEvent={traitSelectionEvent}
        onIncreaseHunger={handleIncreaseHunger}
        onSpendWillpower={handleSpendWillpower}
      />

      {/* Bottom-left floating widgets: Print Calibration & Appearance Customizer */}
      <div
        className="fixed bottom-4 left-4 z-50 print:hidden flex flex-col-reverse items-start gap-2.5 pointer-events-none"
        style={{ maxWidth: '370px', maxHeight: 'calc(100vh - 32px)' }}
      >
        <TempPrintCalibrator
          isDark={isDarkTheme}
          isVisible={showPrintCalibrator}
          onClose={() => handleTogglePrintCalibrator(false)}
          calibration={printCalibration}
          onChangeCalibration={setPrintCalibration}
        />
        <AppearanceCustomizer
          isDark={isDarkTheme}
          isVisible={showAppearanceCustomizer}
          onClose={() => handleToggleAppearanceCustomizer(false)}
          customColors={customColors}
          onChangeCustomColors={handleUpdateCustomColors}
          isSheetDark={effectiveSheetDark}
          onToggleSheetDark={(targetDark) => {
            setIsSheetDark(targetDark);
            try {
              localStorage.setItem('vtm_sheet_dark_theme', targetDark ? 'true' : 'false');
            } catch {}
          }}
          onShowAlert={showAlert}
        />
      </div>
    </div>
  );
}

// src/types/telegram.ts
export interface TelegramWebAppUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
}

export interface TelegramWebAppInitData {
    query_id?: string;
    user?: TelegramWebAppUser;
    receiver?: TelegramWebAppUser;
    chat?: {
        id: number;
        type: string;
        title?: string;
        username?: string;
    };
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
}

export interface TelegramWebAppThemeParams {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    header_bg_color?: string;
    accent_text_color?: string;
    section_bg_color?: string;
    section_header_text_color?: string;
    subtitle_text_color?: string;
    destructive_text_color?: string;
}

export interface TelegramWebAppHapticFeedback {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
}

export interface TelegramWebApp {
    // Basic properties
    initData: string;
    initDataUnsafe: TelegramWebAppInitData;
    version: string;
    platform: string;
    colorScheme: 'light' | 'dark';
    themeParams: TelegramWebAppThemeParams;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    headerColor: string;
    backgroundColor: string;
    isClosingConfirmationEnabled: boolean;
    isVerticalSwipesEnabled: boolean;

    // Methods for app control
    ready: () => void;
    expand: () => void;
    close: () => void;

    // Swipe control methods
    enableVerticalSwipes?: () => void;
    disableVerticalSwipes?: () => void;

    // UI methods
    showAlert: (message: string, callback?: () => void) => void;
    showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
    showPopup: (params: {
        title?: string;
        message: string;
        buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
        }>;
    }, callback?: (button_id: string) => void) => void;

    // Haptic feedback
    HapticFeedback?: TelegramWebAppHapticFeedback;

    // Event methods
    onEvent: (eventType: string, eventHandler: (...args: any[]) => void) => void;
    offEvent: (eventType: string, eventHandler: (...args: any[]) => void) => void;
    sendData: (data: string) => void;

    // Styling methods
    setHeaderColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    enableClosingConfirmation: () => void;
    disableClosingConfirmation: () => void;

    // Main button
    MainButton: {
        text: string;
        color: string;
        textColor: string;
        isVisible: boolean;
        isActive: boolean;
        isProgressVisible: boolean;
        setText: (text: string) => void;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
        enable: () => void;
        disable: () => void;
        showProgress: (leaveActive?: boolean) => void;
        hideProgress: () => void;
        setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
        }) => void;
    };

    // Back button
    BackButton: {
        isVisible: boolean;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
    };
}

export interface TelegramWebAppGlobal {
    WebApp: TelegramWebApp;
}

// Global type declaration - only declare once here
declare global {
    interface Window {
        Telegram?: TelegramWebAppGlobal;
    }
}

// Farmway Design System — Theme Constants
// Derived from logo: teal circle, coral sun, lime leaf, charcoal mountain
// Optimised for outdoor readability (high contrast, large touch targets)

export const COLORS = {
    // Brand — from logo
    primary: '#2B7A78',           // Teal (logo circle)
    primaryLight: '#3AAFA9',
    primaryDark: '#1B5E5B',
    accent: '#E8735A',            // Coral (logo sun)
    accentLight: '#F09A82',

    // Secondary — from logo leaf
    secondary: '#8BBF3A',         // Lime green (logo leaf)
    secondaryLight: '#A8D65A',

    // Neutrals
    background: '#F4F7F6',
    card: '#FFFFFF',
    surface: '#EAF0EE',
    border: '#CBD5D0',

    // Text — from logo mountain
    textPrimary: '#2D3436',       // Charcoal (logo mountain)
    textSecondary: '#576B63',
    textMuted: '#8A9E94',
    textOnPrimary: '#FFFFFF',

    // Status
    success: '#8BBF3A',
    warning: '#F5A623',
    error: '#DC3545',
    info: '#3AAFA9',

    // Category pills
    categoryBg: '#E0F2F1',
    categoryText: '#1B5E5B',

    // Verified badge
    verified: '#2B7A78',
    verifiedBg: '#E0F2F1',

    // Overlay
    overlay: 'rgba(0,0,0,0.5)',
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 22,
        xxl: 28,
        hero: 36,
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    section: 48,
};

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
};

export const SHADOWS = {
    card: {
        shadowColor: '#1B5E5B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    modal: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
    },
};

// Minimum touch target for older users (WAI-ARIA: 44×44pt)
export const MIN_TOUCH = 48;

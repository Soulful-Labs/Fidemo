import type { Config } from 'tailwindcss'

/**
 * Built from get_variable_defs on client frames across Dashboard (826:85021),
 * Studies list (1518:90600), Manage Results (1627:96628), Pool (1645:161580)
 * and Payments (1663:103326). The client app is light mode: its BG, Text and
 * Stroke variables are a different set from the respondent app's, even where
 * the brand yellows and greens match.
 *
 * Names follow the Figma variable paths, so a value in the file maps to a
 * class without a lookup: `BG/primary/bg-1` -> `bg-bg-1`, `Text/subtitle` ->
 * `text-text-subtitle`, `Primary/yellow-500` -> `bg-yellow-500`.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { primary: '#e5940f', secondary: '#3fb984' },
        // BG/primary/* and BG/secondary/*: the warm page greys and the green-tinted surfaces.
        bg: { DEFAULT: '#ffffff', 0: '#fdfdfc', 1: '#f8f8f7', 2: '#f3f2f1', 3: '#eeedec', 4: '#e9e8e7' },
        bgAlt: { 0: '#fbfefd', 1: '#f5f9f7', 2: '#edf3f0' },
        text: { title: '#201e19', subtitle: '#5e5d5b', body: '#9d9d9d', disabled: '#b4b4b4' },
        stroke: { input: '#e9e8e7', 1: '#edf3f0', 2: '#e3edea', 3: '#dae7e1' },
        cta: {
          primary: '#fca311', primaryText: '#15130f',
          secondary: '#fed592', secondaryText: '#513303',
          tertiaryStroke: '#e1e1e1', tertiaryStrokeDisabled: '#e9e8e7',
        },
        yellow: { 20: '#f7f4f0', 30: '#fff7ea', 40: '#fff3e0', 300: '#fdc160', 400: '#fdb541', 500: '#fca311', 700: '#b3740c' },
        green: { 50: '#ecf8f3', 200: '#a7dfc6', 700: '#2d835e' },
        purple: { 100: '#f5f2ff', 600: '#9780fa' },
        blue: { 100: '#ecf6fd', 600: '#42a4ed' },
        neutral: { 500: '#e9e8e7', 700: '#e0dedc', 800: '#dad9d7', 1000: '#ceccca' },
        // Tier chips, measured off the respondent cards (826:85021).
        tier: {
          gold: '#e4b300', goldBg: '#f8f0d2',
          platinum: '#9139f6', platinumBg: '#ebdcfa',
          silver: '#7f9fb1', silverBg: '#e7edef',
        },
      },
      // Space/* and Element/*.
      spacing: {
        0: '0px', 0.5: '2px', 1: '4px', 1.5: '6px', 2: '8px', 3: '12px', 4: '16px', 5: '20px', 6: '24px',
        'el-s': '16px', 'el-m': '20px', 'el-l': '24px', 'el-xl': '32px', 'el-3xl': '48px', 'el-4xl': '56px',
      },
      // Radius/*.
      borderRadius: { none: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px', full: '100px' },
      // Stroke/1, Stroke/1 + Half, Stroke/2.
      borderWidth: { 1: '1px', 1.5: '1.5px', 2: '2px' },
      fontFamily: { sans: ['Geist', 'system-ui', 'sans-serif'] },
      // Lables/*, Body/* and Titles/*. Figma letterSpacing -1 / -2 is -0.01em / -0.02em.
      fontSize: {
        label: ['12px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'text-regular': ['14px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '400' }],
        'text-medium': ['14px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '500' }],
        'text-large': ['14px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '600' }],
        'body-regular': ['16px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '400' }],
        'body-medium': ['16px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '500' }],
        'body-large': ['16px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title-s': ['18px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '500' }],
        'title-m': ['20px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '500' }],
        // Measured off the frames: a 24px title sits in a 31px line box
        // (1777:96823, 1777:96835), not a 24px one.
        'title-l': ['24px', { lineHeight: '31px', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      // Desktop frame: 1440 wide, 240 nav, 72 top bar, 600 side panels, 460 modals.
      maxWidth: { frame: '1440px', page: '1200px', panel: '600px', modal: '460px' },
      height: { topbar: '70px', btn: '40px', 'btn-sm': '32px', input: '48px', row: '52px' },
      width: { nav: '240px', panel: '600px', modal: '460px', input: '48px', btn: '40px' },
    },
  },
  plugins: [],
} satisfies Config

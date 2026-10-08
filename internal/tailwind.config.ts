import type { Config } from 'tailwindcss'

/**
 * Built from get_variable_defs on the internal console's own frames, not copied
 * from the client app: Dashboard (1851:115853), Studies (1874:72973), Manage
 * Results (1932:107613), Review / Survey (1984:122634), Participant profile
 * (2017:148911), Verifications (2022:168589, 2035:109172), Support
 * (2036:159859), Client profile (2051:129453), Finance (2051:154238), Pricing
 * (2051:176489, 2058:196166), Sub-Admin (2060:197775), My Account (2065:205670),
 * Sign In (1849:112091) and the Sidebar asset (1857:127510).
 *
 * Names follow the Figma variable paths, so a value in the file maps to a class
 * without a lookup: `BG/primary/bg-1` -> `bg-bg-1`, `Text/subtitle` ->
 * `text-text-subtitle`, `Primary/yellow-500` -> `bg-yellow-500`.
 *
 * Only values the file defines as variables are here, plus the two shell values
 * the frames draw without one (`shell.*`, measured).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { primary: '#e5940f', secondary: '#3fb984' },
        // BG/BG, BG/primary/* and BG/secondary/*.
        bg: { DEFAULT: '#ffffff', 0: '#fdfdfc', 1: '#f8f8f7', 2: '#f3f2f1' },
        bgAlt: { 0: '#fbfefd', 1: '#f5f9f7', 2: '#edf3f0' },
        // Text/*. The file also carries two capitalised strays, Text/Title #252525
        // and Text/Subtitle #777777, on the Studies and My Account frames.
        text: { title: '#201e19', subtitle: '#5e5d5b', body: '#9d9d9d', titleStray: '#252525', subtitleStray: '#777777' },
        // Stroke/input field and Stroke/stroke-*.
        stroke: { input: '#e9e8e7', 1: '#edf3f0', 2: '#e3edea', 3: '#dae7e1' },
        // CTA/*.
        cta: {
          primary: '#fca311', primaryText: '#15130f',
          secondary: '#fed592', secondaryText: '#513303',
          tertiaryStroke: '#e1e1e1',
        },
        // Primary/yellow-*.
        yellow: {
          30: '#fff7ea', 40: '#fff3e0', 50: '#ffeed1', 100: '#fee2b5', 200: '#fed592',
          300: '#fdc160', 400: '#fdb541', 500: '#fca311', 700: '#b3740c', 800: '#8b5a09',
        },
        // Secondary/green-* and Alpha/green-alpha/green-15.
        green: { 100: '#c3e9d9', 200: '#a7dfc6', alpha15: '#3fb98426' },
        blue: { 600: '#42a4ed' },
        purple: { 600: '#9780fa' },
        // The file's --sds-color-background-* variables, by what they draw.
        // Note: the Verifications frame (2035:109172) binds the red #e33a38 to
        // "positive-hover" and an amber #fcf2da to "positive-secondary"; they
        // are named here by colour, as the frames use them.
        // The two shell values the frames draw without a variable, measured off the PNGs:
        // the sidebar's right edge and the edge of its active pill (#f0f0ef), and the
        // sub-item guide rail (#edebeb). Named here so no screen writes a raw hex.
        shell: { edge: '#f0f0ef', rail: '#edebeb' },
        state: { success: '#14ae5c', successHover: '#009951', successBg: '#d3f8d7', danger: '#e33a38', warningBg: '#fcf2da' },
      },
      // Space/* and Element/*.
      spacing: {
        0: '0px', 0.5: '2px', 1: '4px', 1.5: '6px', 2: '8px', 3: '12px', 4: '16px', 5: '20px', 6: '24px', 8: '32px', 12: '48px',
        'el-s': '16px', 'el-m': '20px', 'el-l': '24px', 'el-xl': '32px', 'el-3xl': '48px',
      },
      // Radius/*.
      borderRadius: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px', '4xl': '48px', full: '100px' },
      // Stroke/Half, Stroke/1, Stroke/1 + Half, Stroke/2.
      borderWidth: { 0.5: '0.5px', 1: '1px', 1.5: '1.5px', 2: '2px' },
      fontFamily: { sans: ['Geist', 'system-ui', 'sans-serif'] },
      // Lables/*, Body/*, Title/* and Heading/*. Figma letterSpacing -1 / -2 is -0.01em / -0.02em.
      // Line heights of 100 are 100%; 1.4 is 140%. To be re-measured on the first screen, as the client's title-l was.
      fontSize: {
        label: ['12px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '400' }],
        'text-regular': ['14px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '400' }],
        'text-medium': ['14px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '500' }],
        'text-large': ['14px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '600' }],
        'body-regular': ['16px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '400' }],
        'body-medium': ['16px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '500' }],
        'title-s': ['18px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '500' }],
        'title-m': ['20px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '500' }],
        'title-l': ['24px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '600' }],
        heading: ['32px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      // The shell, measured off the frames (CLAUDE.md, "The shell").
      width: { nav: '230px', panel: '600px', modal: '460px' },
      height: { topbar: '70px' },
      maxWidth: { frame: '1440px', content: '1162px', panel: '600px', modal: '460px' },
    },
  },
  plugins: [],
} satisfies Config

import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { primary: '#fca311', secondary: '#3fb984' },
        yellow: { 400:'#fdb541', 500:'#fca311', 600:'#e5940f', 700:'#b3740c', 900:'#6a4407', 1000:'#513303' },
        green:  { 500:'#3fb984', 600:'#39a878', 700:'#2d835e', 900:'#1a4e37' },
        bg:     { 0:'#0c0800', 1:'#15130f', 2:'#201e19' },
        bgAlt:  { 0:'#020805', 2:'#202623' },
        stroke: { 1:'#101512', 2:'#202623', 3:'#282d2b' },
        text:   { title:'#fafafa', subtitle:'#e1e1e1', body:'#b9b9b9', disabled:'#5e5d5b' },
        cta:    { primary:'#fca311', primaryText:'#15130f', secondary:'#513303',
                  secondaryText:'#fca311', tertiaryStroke:'#4b4946', tertiaryStrokeDisabled:'#2d2b28' },
        tier:   { gold:'#e4b300', platinum:'#9139f6', silver:'#b9b9b9' },
        state:  { success:'#00cc66', danger:'#e33a38', dangerBg:'#3a1a17' },
        accent: { purple:'#ac99fb', blue:'#68b6f1' },
      },
      backgroundImage: {
        'yellow-fade': 'linear-gradient(180deg, #fca31126 0%, #fca31100 100%)',
        'green-fade':  'linear-gradient(180deg, #3fb98426 0%, #3fb98400 100%)',
        // Primary CTA fill as drawn in Figma: lighter at the top, brand at the bottom.
        'cta-gradient': 'linear-gradient(180deg, #fcc56a 0%, #fca415 100%)',
      },
      spacing: { 0:'0px', 0.5:'2px', 1:'4px', 1.5:'6px', 2:'8px', 3:'12px', 4:'16px', 5:'20px', 6:'24px' },
      borderRadius: { none:'2px', sm:'8px', md:'12px', lg:'16px', xl:'24px', full:'100px' },
      borderWidth: { 1:'1px', 1.5:'1.5px', 2:'2px', 4:'4px' },
      fontFamily: { sans: ['Geist','system-ui','sans-serif'] },
      height: { btn:'48px', 'btn-sm':'38px', 'btn-inline':'24px', input:'48px',
                bar:'56px', 'bar-progress':'93px', nav:'85px', cta:'96px', tag:'30px',
                status:'44px', logo:'24px', promo:'38px', halo:'136px',
                // The phone shell, inset by spacing.4 top and bottom above 420px.
                shell:'calc(100vh - 32px)' },
      inset: { nav:'85px' },
      width: { logo:'20px', halo:'136px', 'dial-sm':'140px', 'dial-md':'200px', 'dial-lg':'272px' },
      maxWidth: { frame:'375px', content:'343px' },
      // Global interaction rule 9: the phone shell kicks in above 420px.
      screens: { frame:'420px' },
      maxHeight: { sheet:'70vh', 'sheet-tall':'85vh' },
      zIndex: { toast:'60' },
      fontSize: {
        label:          ['12px',{ lineHeight:'1.4', letterSpacing:'-0.01em' }],
        'text-regular': ['14px',{ lineHeight:'1.4', letterSpacing:'-0.02em', fontWeight:'400' }],
        'text-medium':  ['14px',{ lineHeight:'1.4', letterSpacing:'-0.02em', fontWeight:'500' }],
        'text-large':   ['14px',{ lineHeight:'1.4', letterSpacing:'-0.02em', fontWeight:'600' }],
        'body-regular': ['16px',{ lineHeight:'1.4', letterSpacing:'-0.01em', fontWeight:'400' }],
        'body-medium':  ['16px',{ lineHeight:'1.4', letterSpacing:'-0.01em', fontWeight:'500' }],
        'body-large':   ['16px',{ lineHeight:'1.4', letterSpacing:'-0.01em', fontWeight:'600' }],
        'title-s':      ['18px',{ lineHeight:'1.4', letterSpacing:'-0.02em', fontWeight:'500' }],
        'title-m':      ['20px',{ lineHeight:'1',   letterSpacing:'-0.02em', fontWeight:'500' }],
        'title-l':      ['24px',{ lineHeight:'1',   letterSpacing:'-0.02em', fontWeight:'600' }],
        // Big numbers: the Trust Score inside the gauge and the wallet balance.
        'display-s':    ['40px',{ lineHeight:'1',   letterSpacing:'-0.02em', fontWeight:'600' }],
        'display':      ['56px',{ lineHeight:'1',   letterSpacing:'-0.02em', fontWeight:'600' }],
      },
    },
  },
  plugins: [],
} satisfies Config

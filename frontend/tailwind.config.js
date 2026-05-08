/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        ink: 'var(--color-ink)',
        charcoal: 'var(--color-charcoal)',
        body: 'var(--color-body)',
        mute: 'var(--color-mute)',
        stone: 'var(--color-stone)',
        ash: 'var(--color-ash)',
        canvas: 'var(--color-canvas)',
        'surface-soft': 'var(--color-surface-soft)',
        'surface-card': 'var(--color-surface-card)',
        hairline: 'var(--color-hairline)',
        accent: '#007aff',
        success: '#30d158',
        danger: '#ff3b30',
        warning: '#ff9f0a',
      },
      fontFamily: {
        mono: ['Berkeley Mono', 'JetBrains Mono', 'IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
      },
      spacing: {
        section: '96px',
      },
    },
  },
  plugins: [],
}

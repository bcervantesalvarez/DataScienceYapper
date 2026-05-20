// tailwind.config.ts
// Design tokens live in src/styles/global.css as CSS custom properties;
// this file just exposes them to Tailwind utilities. Single source of truth.
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg:              'rgb(var(--color-bg) / <alpha-value>)',
        surface:         'rgb(var(--color-surface) / <alpha-value>)',
        'surface-soft':  'rgb(var(--color-surface-soft) / <alpha-value>)',
        ink:             'rgb(var(--color-ink) / <alpha-value>)',
        body:            'rgb(var(--color-body) / <alpha-value>)',
        muted:           'rgb(var(--color-muted) / <alpha-value>)',
        rule:            'rgb(var(--color-rule) / <alpha-value>)',
        'rule-strong':   'rgb(var(--color-rule-strong) / <alpha-value>)',
        accent:          'rgb(var(--color-accent) / <alpha-value>)',
        'accent-ink':    'rgb(var(--color-accent-ink) / <alpha-value>)',
        status:          'rgb(var(--color-status) / <alpha-value>)',
        danger:          'rgb(var(--color-danger) / <alpha-value>)',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Source Serif Pro', 'Georgia', 'serif'],
        mono:  ['ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      maxWidth: {
        prose: '72ch',
        wrap:  '1180px',
        narrow: '720px',
      },
      fontSize: {
        // Mid-size workhorse body type
        base: ['1.0625rem', { lineHeight: '1.65' }],
        lede: ['1.25rem',   { lineHeight: '1.55' }],
      },
      animation: {
        'el-rise': 'el-rise 0.7s cubic-bezier(0.2, 0, 0.2, 1) both',
        'el-fade': 'el-fade 1s   cubic-bezier(0.2, 0, 0.2, 1) both',
        'el-ping': 'el-ping 2s   cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'el-rise': {
          'from': { opacity: '0', transform: 'translateY(14px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        'el-fade': {
          'from': { opacity: '0' },
          'to':   { opacity: '1' },
        },
        'el-ping': {
          '0%':        { transform: 'scale(1)', opacity: '0.5' },
          '75%, 100%': { transform: 'scale(3)', opacity: '0'   },
        },
      },
    },
  },
} satisfies Config;

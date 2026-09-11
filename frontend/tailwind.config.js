export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          100: 'var(--theme-100)',
          500: 'var(--theme-500)',
          600: 'var(--theme-600)',
          700: 'var(--theme-700)',
          primary: 'var(--theme-primary)',
          hover: 'var(--theme-hover)',
        },
        surface: 'var(--bg-surface)',
        body: 'var(--bg-body)',
        'surface-hover': 'var(--bg-hover)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'border-main': 'var(--border-main)',
      }
    },
  },
  plugins: [],
}

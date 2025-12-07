module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'accent-green': '#10b981',
        'accent-soft': '#bbf7d0',
        'muted': '#6b7280',
        'glass-1': 'rgba(255,255,255,0.72)',
        'glass-2': 'rgba(255,255,255,0.9)',
        'bg-soft': '#f7fafc'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      spacing: {
        'cell-x': '8px',
        'cell-y': '6px',
      }
      ,
      boxShadow: {
        'soft-lg': '0 8px 30px rgba(16,24,40,0.08)',
        'glass': '0 6px 20px rgba(2,6,23,0.08)'
      }
    },
  },
  plugins: [],
}

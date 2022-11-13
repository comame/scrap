const { config } = require('@charcoal-ui/tailwind-config')

config.theme.screens.mobile = { 'max': '700px' }
config.theme.screens.desktop = { 'min': '700px' }
config.theme.colors.tag = {
  DEFAULT: '#e9e7e7',
  hover: '#dddcdc'
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "**/*.tsx",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  presets: [config],
}

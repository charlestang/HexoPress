/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
    '.eslintrc-auto-import.json',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  ignorePatterns: ['main.mjs', 'preload.js', 'forge.config.cjs', 'blog/'],
}

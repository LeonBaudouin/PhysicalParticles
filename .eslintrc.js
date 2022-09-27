module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: ['@nuxtjs/eslint-config-typescript', 'plugin:nuxt/recommended', 'prettier'],
  plugins: [],
  // add your custom rules here
  rules: {
    '@typescript-eslint/no-unused-vars': ['off'],
    'eslint-disable-next-line import/no-named-as-default': ['off'],
    eqeqeq: ['off'],
    'consistent-type-imports': false,
    endOfLine: 'lf',
  },
}

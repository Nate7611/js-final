// eslint.config.mjs
export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
      }
    },
    files: ['**/*.js'],
    rules: {
      'linebreak-style': ['error', 'windows'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'no-unused-vars': ['warn'],
      'no-undef': 'error',
      camelcase: 'warn',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'brace-style': 'off',
      'prefer-const': 'warn',
      'max-len': ['warn', { code: 150, ignoreUrls: true, ignoreComments: false, ignoreTrailingComments: false }],
      'no-trailing-spaces': 'error'
    }
  }
];
const finalConfig = {
  'extends': ['@xylabs'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', project: './tsconfig-eslint.json', sourceType: 'module', tsconfigRootDir: null },
  'root': true,
  'ignorePatterns': [
    'dist',
    'node_modules',
    '**/node_modules',
    '**/dist',
    'docs',
    'build',
    'coverage',
    'public',
    'scripts',
    '.yarn',
    '.*'
  ],
  'rules': {
    'id-denylist': ['warn', 'module'],
    '@typescript-eslint/no-floating-promises': [2],
    '@typescript-eslint/no-misused-promises': [0],
    '@typescript-eslint/explicit-member-accessibility': ['warn', { 'accessibility': 'no-public' }],
    'no-restricted-imports': [
      'warn',
      {
        'paths': [
          '@mui/system',
          'react-player',
          'filepond',
          'aos',
          'react-icons',
          '.',
          '..',
          '../..',
          '../../..',
          '../../../..',
          '../../../../..',
          '../../../../../..',
          '../../../../../../..'
        ]
      }
    ],
    'import/no-internal-modules': [
      'off'
    ]
  }
}

module.exports = finalConfig

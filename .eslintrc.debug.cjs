const importConfig = {
  extends: ['plugin:import/errors', 'plugin:import/warnings', 'plugin:import/typescript'],
  plugins: ['import', 'simple-import-sort'],
  rules: {
    'import/default': ['off'],
    'import/named': ['off'],
    'import/namespace': ['off'],
    'import/no-absolute-path': ['warn'],
    'import/no-cycle': [
      'off',
      {
        maxDepth: 2,
      },
    ],
    'import/no-default-export': ['warn'],
    'import/no-deprecated': ['warn'],
    'import/no-internal-modules': [
      'warn',
      {
        allow: ['lodash/*'],
      },
    ],
    'import/no-named-as-default': ['warn'],
    'import/no-named-as-default-member': ['off'],
    'import/no-restricted-paths': ['warn'],
    'import/no-self-import': ['warn'],
    'import/no-useless-path-segments': ['warn'],
    'simple-import-sort/exports': ['warn'],
    'simple-import-sort/imports': ['warn'],
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
}

const jsonConfig = {
  overrides: [
    {
      extends: 'plugin:eslint-plugin-json-es/recommended',
      files: ['*.json'],
      parser: 'eslint-plugin-json-es',
      rules: {
        'prettier/prettier': ['off'],
      },
    },
  ],
}

const markdownConfig = {
  extends: ['plugin:md/recommended'],
  overrides: [
    {
      files: ['*.md'],
      rules: {
        'md/remark': [
          'warn',
          {
            plugins: ['preset-lint-markdown-style-guide', 'frontmatter', ['lint-list-item-indent', 'tab-size']],
          },
        ],
        'prettier/prettier': [
          'off',
          // Important to force prettier to use "markdown" parser - otherwise it wouldn't be able to parse *.md files.
          // You also can configure other options supported by prettier here - "prose-wrap" is
          // particularly useful for *.md files
          { parser: 'markdown' },
        ],
      },
    },
  ],
}

const prettierConfig = {
  extends: ['plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'warn',
      {
        bracketSpacing: true,
        endOfLine: 'lf',
        printWidth: 150,
        semi: false,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'all',
        useTabs: false,
      },
    ],
  },
}

const rulesConfig = {
  plugins: ['sort-keys-fix', 'no-secrets'],
  rules: {
    complexity: ['error', 18],
    'max-depth': ['error', 6],
    'max-lines': [
      'error',
      {
        max: 512,
        skipBlankLines: true,
      },
    ],
    'max-nested-callbacks': ['error', 6],
    'max-statements': ['error', 32],
    'no-restricted-imports': [
      'warn',
      {
        paths: [
          'lodash',
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
          '../../../../../../..',
        ],
      },
    ],
    'no-secrets/no-secrets': ['off'],
    'no-tabs': ['error'],
    'no-unused-vars': 'off',
    'no-useless-escape': 'off',
    quotes: [2, 'single', 'avoid-escape'],
    'require-await': 'error',
    semi: ['warn', 'never'],
    'sort-keys-fix/sort-keys-fix': 'warn',
  },
}

const typescriptConfig = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:@typescript-eslint/recommended-requiring-type-checking'],
  overrides: [
    {
      files: ['*.ts*', '*.d.ts*'],
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/member-delimiter-style': [
          'error',
          {
            multiline: {
              delimiter: 'none',
              requireLast: true,
            },
            singleline: {
              delimiter: 'semi',
              requireLast: false,
            },
          },
        ],
        '@typescript-eslint/member-ordering': [
          'warn',
          {
            default: {
              memberTypes: [
                'signature',
                'call-signature',
                'public-static-field',
                'protected-static-field',
                'private-static-field',
                'public-decorated-field',
                'protected-decorated-field',
                'private-decorated-field',
                'public-instance-field',
                'protected-instance-field',
                'private-instance-field',
                'public-abstract-field',
                'protected-abstract-field',
                'public-field',
                'protected-field',
                'private-field',
                'static-field',
                'instance-field',
                'abstract-field',
                'decorated-field',
                'field',
                'public-constructor',
                'protected-constructor',
                'private-constructor',
                'constructor',
                ['public-static-get', 'public-static-set'],
                ['protected-static-get', 'protected-static-set'],
                ['private-static-get', 'private-static-set'],
                ['public-decorated-get', 'public-decorated-set'],
                ['protected-decorated-get', 'protected-decorated-set'],
                ['private-decorated-get', 'private-decorated-set'],
                ['public-instance-get', 'public-instance-set'],
                ['protected-instance-get', 'protected-instance-set'],
                ['private-instance-get', 'private-instance-set'],
                ['public-abstract-get', 'public-abstract-set'],
                ['protected-abstract-get', 'protected-abstract-set'],
                ['public-get', 'public-set'],
                ['protected-get', 'protected-set'],
                ['private-get', 'private-set'],
                ['static-get', 'static-set'],
                ['instance-get', 'instance-set'],
                ['abstract-get', 'abstract-set'],
                ['decorated-get', 'decorated-set'],
                'get',
                'set',
                'public-static-method',
                'protected-static-method',
                'private-static-method',
                'public-decorated-method',
                'protected-decorated-method',
                'private-decorated-method',
                'public-instance-method',
                'protected-instance-method',
                'private-instance-method',
                'public-abstract-method',
                'protected-abstract-method',
                'public-method',
                'protected-method',
                'private-method',
                'static-method',
                'instance-method',
                'abstract-method',
                'decorated-method',
                'method',
              ],
              order: 'alphabetically',
            },
          },
        ],
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/semi': ['warn', 'never'],
      },
    },
  ],
}

const workspacesConfig = {
  extends: ['plugin:workspaces/recommended'],
  plugins: ['workspaces'],
  rules: {
    'workspaces/no-relative-imports': ['off'],
    'workspaces/require-dependency': ['off'],
  },
}

function toArray(value) {
  if (value === undefined) {
    return []
  }
  if (Array.isArray(value)) {
    return value
  } else {
    return [value]
  }
}

const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', project: ['./tsconfig.json'], tsconfigRootDir: __dirname },
  extends: [
    ...toArray(typescriptConfig.extends),
    ...toArray(workspacesConfig.extends),
    ...toArray(prettierConfig.extends),
    ...toArray(rulesConfig.extends),
    //...toArray(markdownConfig.extends),
    ...toArray(importConfig.extends),
    //...toArray(jsonConfig.extends),
  ],
  ignorePatterns: ['node_modules', 'dist', 'bin', 'storybook-static', '.github', '.vscode', '.yarn', 'package.json'],
  overrides: [
    ...toArray(typescriptConfig.overrides),
    ...toArray(workspacesConfig.overrides),
    ...toArray(prettierConfig.overrides),
    ...toArray(rulesConfig.overrides),
    //...toArray(markdownConfig.overrides),
    ...toArray(importConfig.overrides),
    //...toArray(jsonConfig.overrides),
  ],
  plugins: [
    ...toArray(typescriptConfig.plugins),
    ...toArray(workspacesConfig.plugins),
    ...toArray(prettierConfig.plugins),
    ...toArray(rulesConfig.plugins),
    //...toArray(markdownConfig.plugins),
    ...toArray(importConfig.plugins),
    //...toArray(jsonConfig.plugins),
  ],
  rules: {
    ...typescriptConfig.rules,
    ...workspacesConfig.rules,
    ...prettierConfig.rules,
    ...rulesConfig.rules,
    //...markdownConfig.rules,
    ...importConfig.rules,
    //...jsonConfig.rules,
    "no-restricted-imports": [
      "warn",
      {
        "paths": [
          "@xyo-network/bridge",
          "@xyo-network/core",
          "@xyo-network/module",
          "@xyo-network/modules",
          "@xyo-network/node",
          "@xyo-network/sdk",
          "@xyo-network/plugins",
          "@xyo-network/protocol",
          "@xyo-network/witness",
          "react-player",
          "filepond",
          "aos",
          "react-icons",
          ".",
          "..",
          "../..",
          "../../..",
          "../../../..",
          "../../../../..",
          "../../../../../..",
          "../../../../../../.."
        ]
      }
    ],
    "import/no-internal-modules": [
      "warn", {
        "allow": [
          "source-map-support/*",
          "lodash/*",
          "aws-sdk/**/*",
          "types/*"
        ]
      }
    ]
  },
  settings: {
    ...typescriptConfig.settings,
    ...workspacesConfig.settings,
    ...prettierConfig.settings,
    ...rulesConfig.settings,
    //...markdownConfig.settings,
    ...importConfig.settings,
    //...jsonConfig.settings,
  },
}


const finalConfig = {
  ...config,
  "root": true,
  "ignorePatterns": [
    "dist",
    "node_modules",
    "docs",
    "coverage",
    "docker",
    "nftData",
    "testData.json",
    "*.stories.*",
    "swagger.json",
    ".yarn",
    ".*"
  ]
}

console.log(JSON.stringify(finalConfig, null, 2))

module.exports = finalConfig

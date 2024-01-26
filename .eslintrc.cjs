const finalConfig = {
  env: {
    es2024: true
  },
  'extends': ['@xylabs', 'plugin:unicorn/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', project: './tsconfig.json', sourceType: 'module', tsconfigRootDir: null },
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
  ],
  "rules": {
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "unicorn/filename-case": ["off"],
    "unicorn/no-nested-ternary": ["off"],
    "unicorn/no-array-callback-reference": ["off"],
    "unicorn/prevent-abbreviations": ["off"],
    "unicorn/no-null": ["off"],
    "unicorn/number-literal-case": ["off"],
    "unicorn/no-await-expression-member": ["off"],
    "unicorn/new-for-builtins": ["off"],
    "unicorn/catch-error-name": ["off"],
    "unicorn/prefer-top-level-await": ["off"],
    "unicorn/consistent-function-scoping": ["off"],
    "unicorn/prefer-module": ["off"],
    "import/no-default-export": ["off"],
    "@typescript-eslint/explicit-member-accessibility": ["warn", { "accessibility": "no-public" }],
    "no-restricted-imports": [
      "warn",
      {
        "paths": [
          "@xyo-network/archivist",
          "@xyo-network/bridge",
          "@xyo-network/core",
          "@xyo-network/diviner",
          "@xyo-network/module",
          "@xyo-network/modules",
          "@xyo-network/node",
          "@xyo-network/sdk",
          "@xyo-network/plugins",
          "@xyo-network/protocol",
          "@xyo-network/sentinel",
          "@xyo-network/witness",
          "@xyo-network/core-payload-plugins",
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
  }
}

module.exports = finalConfig

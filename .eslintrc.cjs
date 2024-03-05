const finalConfig = {
  env: {
    es2024: true
  },
  'extends': ['@xylabs', "plugin:deprecation/recommended"],
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
    "import/no-cycle": ["warn"],
    "deprecation/deprecation": ["warn"],
    "import/no-default-export": ["off"],
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

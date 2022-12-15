const generateJestConfig = ({ esModules }) => {
  const esModulesList = Array.isArray(esModules) ? esModules.join('|') : esModules
  return {
    coveragePathIgnorePatterns: ['<rootDir>/src/Server'],
    coverageThreshold: {
      global: {
        branches: 50,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    preset: 'ts-jest/presets/default-esm',
    setupFiles: ['dotenv/config'],
    setupFilesAfterEnv: ['jest-extended/all', 'jest-sorted'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    testTimeout: 15000,
    transform: {
      [`(${esModulesList}).+\\.js$`]: [
        'babel-jest',
        {
          babelConfig: 'babel.config.json',
          useESM: true,
        },
      ],
      '^.+\\.tsx?$': [
        'ts-jest',
        {
          tsconfig: 'tsconfig.test.json',
          useESM: true,
        },
      ],
    },
    transformIgnorePatterns: [`./node_modules/(?!${esModulesList})`],
  }
}

// eslint-disable-next-line no-undef
module.exports = generateJestConfig({ esModules: ['is-ip', 'ip-regex'] })

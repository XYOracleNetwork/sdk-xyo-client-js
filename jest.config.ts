const generateJestConfig = ({ esModules }: { esModules: string[] }) => {
  const esModulesList = Array.isArray(esModules) ? esModules.join('|') : esModules
  return {
    coveragePathIgnorePatterns: ['<rootDir>/(.*)/dist'],
    globalSetup: './jestSetup/globalSetup.ts',
    globalTeardown: './jestSetup/globalTeardown.ts',
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    preset: 'ts-jest/presets/default-esm',
    setupFiles: ['dotenv/config'],
    setupFilesAfterEnv: ['jest-sorted', 'jest-extended/all', './jestSetup/setupFiles.ts'],
    testRegex: '(/__tests__/.*|(\\.|/)((!perf\\.)test|spec))\\.tsx?$',
    testTimeout: 200000,
    transform: {
      [`(${esModulesList}).+\\.js$`]: 'babel-jest',
      '^.+\\.tsx?$': [
        'ts-jest',
        {
          tsconfig: 'tsconfig.test.json',
        },
      ],
    },
    transformIgnorePatterns: [`./node_modules/(?!${esModulesList})`],
  }
}

const config = generateJestConfig({ esModules: ['is-ip', 'ip-regex', 'lodash-es', 'uuid', 'lodash-es', 'quick-lru'] })

// eslint-disable-next-line import/no-default-export
export default config

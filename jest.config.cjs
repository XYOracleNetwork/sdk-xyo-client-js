const generateJestConfig = ({ esModules }) => {
  const esModuleslist = Array.isArray(esModules) ? esModules.join('|') : esModules
  return {
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.test.json',
      },
    },
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    preset: 'ts-jest/presets/default-esm',
    setupFiles: ['dotenv/config'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    transform: {
      [`(${esModuleslist}).+\\.js$`]: 'babel-jest',
      '^.+\\.tsx?$': 'ts-jest',
    },
    transformIgnorePatterns: [`./node_modules/(?!${esModuleslist})`],
  }
}

module.exports = generateJestConfig({ esModules: ['is-ip', 'ip-regex'] })

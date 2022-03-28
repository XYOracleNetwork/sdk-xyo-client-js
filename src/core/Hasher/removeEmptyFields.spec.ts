import { removeEmptyFields } from './removeEmptyFields'

describe('removeEmptyFields', () => {
  test('deep', () => {
    const testObject = {
      testArray: [1, 2, 3],
      testBoolean: true,
      testNull: null,
      testNullObject: { t: null, x: undefined },
      testNumber: 5,
      testObject: { t: 1 },
      testSomeNullObject: { s: 1, t: null, x: undefined },
      testString: 'hi',
      testUndefined: undefined,
    }

    const result = removeEmptyFields(testObject)

    expect(Object.keys(result).length).toBe(8)
    expect(Object.keys(result.testSomeNullObject as object).length).toBe(2)
    expect(Object.keys(result.testNullObject as object).length).toBe(1)
  })
})

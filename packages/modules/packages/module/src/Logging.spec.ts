import { Logging } from './Logging'

describe('Logging', () => {
  test('getFunctionName:function', () => {
    const logging = new Logging(console, 'test_id')

    const test = () => {
      return logging.log('Test')
    }
    test()
    expect(test).toBeDefined()
  })
})

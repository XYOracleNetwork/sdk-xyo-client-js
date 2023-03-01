import { IdLogger } from '../IdLogger'

describe('Logging', () => {
  test('getFunctionName:function', () => {
    const logging = new IdLogger(console, () => 'test_id')

    const test = () => {
      return logging.log('Test')
    }
    test()
    expect(test).toBeDefined()
  })
})

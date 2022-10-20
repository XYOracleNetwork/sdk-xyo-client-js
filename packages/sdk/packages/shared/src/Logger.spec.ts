import { getFunctionName } from './Logger'

describe('Logger', () => {
  test('getFunctionName:function', () => {
    const test = () => {
      return getFunctionName()
    }
    const funcName = test()
    expect(funcName).toBe('test')
  })
  test('getFunctionName:constructor', () => {
    class Foo {
      funcName: string
      constructor() {
        this.funcName = getFunctionName()
      }
    }

    const foo = new Foo()
    expect(foo.funcName).toBe('new Foo')
  })

  test('getFunctionName:method', () => {
    class Foo {
      funcName: string
      constructor() {
        this.funcName = this.test()
      }

      test() {
        return getFunctionName()
      }
    }

    const foo = new Foo()
    expect(foo.funcName).toBe('Foo.test')
  })

  test('getFunctionName:static', () => {
    class Foo {
      funcName: string
      constructor() {
        this.funcName = Foo.test()
      }

      static test() {
        return getFunctionName()
      }
    }

    const foo = new Foo()
    expect(foo.funcName).toBe('Function.test')
  })
})

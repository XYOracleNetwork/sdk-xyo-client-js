import { XyoModule } from './XyoModule'
export class XyoTestModule extends XyoModule {
  static override async create(params?: object) {
    return await super.create(params)
  }
}

describe('XyoModule', () => {
  it('should instantiate', async () => {
    const module = await XyoTestModule.create()
    expect(module).toBeTruthy()
  })

  it('should validate config', async () => {
    class TestClass {}
    const testModule = await XyoTestModule.create()

    const invalidConfig = {
      config: {
        options: {
          foo: new TestClass(),
        },
      },
    }

    const validConfig = {
      config: {
        options: {
          foo: 'foo',
        },
      },
    }
    expect(testModule['validateConfig'](invalidConfig)).toBeFalse()
    expect(testModule['validateConfig'](validConfig)).toBeTrue()
  })
})

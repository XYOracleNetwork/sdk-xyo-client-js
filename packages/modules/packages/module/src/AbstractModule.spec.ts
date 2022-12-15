import { AbstractModule } from './AbstractModule'
export class TestAbstractModule extends AbstractModule {
  static override async create(params?: object) {
    return await super.create(params)
  }
}

describe('AbstractModule', () => {
  it('should instantiate', async () => {
    const module = await TestAbstractModule.create()
    expect(module).toBeTruthy()
  })

  it('should validate config', async () => {
    class TestClass {}
    const testModule = await TestAbstractModule.create()

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

import { Account } from '@xyo-network/account'

import { HttpBridge, HttpBridgeParams } from '../HttpBridge'
import { HttpBridgeConfigSchema } from '../HttpBridgeConfig'

describe('HttpBridge', () => {
  let httpBridge: HttpBridge<HttpBridgeParams>

  beforeEach(async () => {
    httpBridge = await HttpBridge.create({
      account: Account.randomSync(),
      config: { name: 'TestBridge', nodeUrl: 'http://localhost:8080', schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })
  })

  it('should create an instance of HttpBridge', () => {
    expect(httpBridge).toBeInstanceOf(HttpBridge)
  })

  it('should have axios instance', () => {
    expect(httpBridge.axios).toBeDefined()
  })

  it('should have nodeUrl defined', () => {
    expect(httpBridge.nodeUrl).toBe('http://localhost:8080')
  })

  it('should have resolver defined', () => {
    expect(httpBridge.resolver).toBeDefined()
  })

  it('should return correct moduleUrl', () => {
    const address = '0x1234'
    expect(httpBridge.moduleUrl(address).toString()).toBe('http://localhost:8080/0x1234')
  })

  it('should throw error on call to exposeHandler', async () => {
    try {
      await httpBridge.exposeHandler('test')
      fail('exposeHandler should have thrown an error')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('should throw error on call to unexposeHandler', async () => {
    try {
      await httpBridge.unexposeHandler('test')
      fail('unexposeHandler should have thrown an error')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})

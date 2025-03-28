import '@xylabs/vitest-extended'

import {
  beforeEach,
  describe, expect, it,
} from 'vitest'

import { HttpBridgeConfigSchema } from '../HttpBridgeConfig.ts'
import type { HttpBridgeParams } from '../HttpBridgeFull.ts'
import { HttpBridge } from '../HttpBridgeFull.ts'

describe('HttpBridge', () => {
  let httpBridge: HttpBridge<HttpBridgeParams>

  beforeEach(async () => {
    httpBridge = await HttpBridge.create({
      account: 'random',
      config: {
        name: 'TestBridge', nodeUrl: 'http://localhost:8080', schema: HttpBridgeConfigSchema, security: { allowAnonymous: true },
      },
    })
  })

  it('should create an instance of HttpBridge', () => {
    expect(httpBridge).toBeInstanceOf(HttpBridge)
  })

  it('should have axios instance', () => {
    expect(httpBridge.axios).toBeDefined()
  })

  it('should have nodeUrl defined', () => {
    expect(httpBridge.clientUrl).toBe('http://localhost:8080')
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
      expect('').toBe('exposeHandler should have thrown an error')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('should throw error on call to unexposeHandler', async () => {
    try {
      await httpBridge.unexposeHandler('test')
      expect('').toBe('unexposeHandler should have thrown an error')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})

import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { BridgeExposeOptions, BridgeModule, BridgeParams, BridgeUnexposeOptions } from '@xyo-network/bridge-model'
import { AnyConfigSchema, creatableModule, ModuleInstance } from '@xyo-network/module-model'

import { WebsocketBridgeConfig, WebsocketBridgeConfigSchema } from './Config'
import { WebsocketBridgeModuleResolver } from './ModuleResolver'

export type WebsocketBridgeParams<TConfig extends AnyConfigSchema<WebsocketBridgeConfig> = AnyConfigSchema<WebsocketBridgeConfig>> =
  BridgeParams<TConfig>

@creatableModule()
export class WebsocketBridge<TParams extends WebsocketBridgeParams> extends AbstractBridge<TParams> implements BridgeModule<TParams> {
  static override configSchemas = [WebsocketBridgeConfigSchema]
  static maxPayloadSizeWarning = 256 * 256

  private _resolver?: WebsocketBridgeModuleResolver

  override get resolver() {
    this._resolver = this._resolver ?? new WebsocketBridgeModuleResolver({ bridge: this, url: this.url, wrapperAccount: this.account })
    return this._resolver
  }

  get url() {
    return assertEx(this.config.url, () => 'No Url Set')
  }

  override async discoverRoots(): Promise<ModuleInstance[]> {
    return await Promise.resolve([])
  }

  override exposeHandler(_id: string, _options?: BridgeExposeOptions | undefined): Promisable<ModuleInstance[]> {
    throw new Error('Unsupported')
  }

  override exposedHandler(): Promisable<Address[]> {
    throw new Error('Unsupported')
  }

  override async startHandler(): Promise<boolean> {
    // eslint-disable-next-line deprecation/deprecation
    const { discoverRoot = true, legacyMode } = this.config
    if (discoverRoot || legacyMode) {
      await this.discoverRoots()
    }
    return true
  }

  override unexposeHandler(_id: string, _options?: BridgeUnexposeOptions | undefined): Promisable<ModuleInstance[]> {
    throw new Error('Unsupported')
  }
}

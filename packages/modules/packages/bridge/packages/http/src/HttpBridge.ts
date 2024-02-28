import { AxiosJson } from '@xylabs/axios'
import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { Account } from '@xyo-network/account'
import { BridgeExposeOptions, BridgeModule, BridgeParams, BridgeUnexposeOptions } from '@xyo-network/bridge-model'
import { AnyConfigSchema, creatableModule, ModuleEventData, ModuleFilterOptions, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'

import { HttpBridgeConfig, HttpBridgeConfigSchema } from './HttpBridgeConfig'
import { HttpModuleProxy, HttpModuleProxyParams } from './ModuleProxy'

export type HttpBridgeParams<TConfig extends AnyConfigSchema<HttpBridgeConfig> = AnyConfigSchema<HttpBridgeConfig>> = BridgeParams<TConfig>

@creatableModule()
export class HttpBridge<TParams extends HttpBridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractBridge<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
{
  static override configSchemas = [HttpBridgeConfigSchema]
  static maxPayloadSizeWarning = 256 * 256

  private _axios?: AxiosJson

  get axios() {
    this._axios = this._axios ?? new AxiosJson()
    return this._axios
  }

  get nodeUrl() {
    return this.config.nodeUrl
  }

  override exposeHandler(_id: string, _options?: BridgeExposeOptions | undefined): Promisable<Lowercase<string>[]> {
    throw new Error('Unsupported')
  }

  moduleUrl(address: Address) {
    return new URL(address, this.nodeUrl)
  }

  resolveHandler<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, _options?: ModuleFilterOptions<T>): Promisable<T | undefined> {
    const params: HttpModuleProxyParams = {
      account: Account.randomSync(),
      axios: this.axios,
      bridge: this,
      moduleAddress: id as Address,
      moduleUrl: this.moduleUrl(id as Address).href,
    }
    return new HttpModuleProxy<T>(params) as unknown as T
  }

  override unexposeHandler(_id: string, _options?: BridgeUnexposeOptions | undefined): Promisable<Lowercase<string>[]> {
    throw new Error('Unsupported')
  }
}

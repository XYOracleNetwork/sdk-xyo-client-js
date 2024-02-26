import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { Account } from '@xyo-network/account'
import { BridgeExposeOptions, BridgeModule, BridgeUnexposeOptions } from '@xyo-network/bridge-model'
import { creatableModule, ModuleEventData, ModuleFilterOptions, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'
import { ModuleWrapper } from '@xyo-network/module-wrapper'
import { LRUCache } from 'lru-cache'

import { AsyncQueryBusClient, AsyncQueryBusHost, AsyncQueryBusModuleProxy, AsyncQueryBusModuleProxyParams } from './AsyncQueryBus'
import { PubSubBridgeConfigSchema } from './Config'
import { PubSubBridgeParams } from './Params'

const moduleName = 'PubSubBridge'

@creatableModule()
export class PubSubBridge<TParams extends PubSubBridgeParams = PubSubBridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractBridge<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
{
  static override configSchemas = [PubSubBridgeConfigSchema]

  protected _configRootAddress: Address = ''
  protected _configStateStoreArchivist: string = ''
  protected _configStateStoreBoundWitnessDiviner: string = ''
  protected _exposedAddresses: Address[] = []
  protected _lastState?: LRUCache<string, number>

  private _busClient?: AsyncQueryBusClient
  private _busHost?: AsyncQueryBusHost

  protected get moduleName() {
    return `${this.config.name ?? moduleName}`
  }

  async exposeHandler(id: ModuleIdentifier, options?: BridgeExposeOptions | undefined): Promise<Lowercase<string>[]> {
    const filterOptions: ModuleFilterOptions = { direction: options?.direction }
    const module = await super.resolve(id, filterOptions)
    if (module) {
      const host = assertEx(this.busHost(), 'Not configured as a host')
      host.expose(module.address)
      return [module.address]
    }
    return []
  }

  resolveHandler<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, _options?: ModuleFilterOptions<T>): Promisable<T | undefined> {
    const account = Account.randomSync()
    const params: AsyncQueryBusModuleProxyParams = {
      account,
      busClient: assertEx(this.busClient(), 'Bus client not initialized'),
      moduleAddress: id as Address,
    }
    return new AsyncQueryBusModuleProxy<T>(params) as unknown as T
  }

  async unexposeHandler(id: ModuleIdentifier, options?: BridgeUnexposeOptions | undefined): Promise<Lowercase<string>[]> {
    const filterOptions: ModuleFilterOptions = { direction: options?.direction }
    const module = await super.resolve(id, filterOptions)
    if (module) {
      const host = assertEx(this.busHost(), 'Not configured as a host')
      host.unexpose(module.address)
      return [module.address]
    }
    return []
  }

  protected busClient() {
    if (!this._busClient && this.config.client) {
      this._busClient = new AsyncQueryBusClient({
        config: this.config.client,
        logger: this.logger,
        resolver: this,
      })
    }
    return this._busClient
  }

  protected busHost() {
    if (!this._busHost && this.config.host) {
      this._busHost = new AsyncQueryBusHost({
        config: this.config.host,
        logger: this.logger,
        resolver: this,
      })
    }
    return this._busHost
  }

  protected override startHandler(): Promise<boolean> {
    this.busHost()?.start()
    return Promise.resolve(true)
  }

  protected override stopHandler(_timeout?: number | undefined) {
    this.busHost()?.stop()
    return true
  }
}

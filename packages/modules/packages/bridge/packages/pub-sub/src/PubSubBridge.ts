import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { BridgeExposeOptions, BridgeModule, BridgeUnexposeOptions } from '@xyo-network/bridge-model'
import { creatableModule, ModuleFilterOptions, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'
import { LRUCache } from 'lru-cache'

import { AsyncQueryBusClient, AsyncQueryBusHost } from './AsyncQueryBus'
import { PubSubBridgeConfigSchema } from './Config'
import { PubSubBridgeParams } from './Params'
import { PubSubBridgeModuleResolver } from './PubSubBridgeModuleResolver'

const moduleName = 'PubSubBridge'

@creatableModule()
export class PubSubBridge<TParams extends PubSubBridgeParams = PubSubBridgeParams> extends AbstractBridge<TParams> implements BridgeModule<TParams> {
  static override configSchemas = [PubSubBridgeConfigSchema]

  protected _configRootAddress: Address = ''
  protected _configStateStoreArchivist: string = ''
  protected _configStateStoreBoundWitnessDiviner: string = ''
  protected _exposedAddresses: Address[] = []
  protected _lastState?: LRUCache<string, number>

  private _busClient?: AsyncQueryBusClient
  private _busHost?: AsyncQueryBusHost
  private _resolver?: PubSubBridgeModuleResolver

  override get resolver() {
    this._resolver =
      this._resolver ??
      new PubSubBridgeModuleResolver({
        bridge: this,
        busClient: assertEx(this.busClient(), () => 'busClient not configured'),
        wrapperAccount: this.account,
      })
    return this._resolver
  }

  protected get moduleName() {
    return `${this.config.name ?? moduleName}`
  }

  protected get roots() {
    return assertEx(this.config.roots, () => 'roots not configured')
  }

  async exposeHandler(id: ModuleIdentifier, options?: BridgeExposeOptions | undefined): Promise<Address[]> {
    const filterOptions: ModuleFilterOptions = { direction: options?.direction }
    const module = await super.resolve(id, filterOptions)
    if (module) {
      const host = assertEx(this.busHost(), () => 'Not configured as a host')
      host.expose(module.address)
      return [module.address]
    }
    return []
  }

  override async startHandler(): Promise<boolean> {
    this.busHost()?.start()
    return await super.startHandler()
  }

  async unexposeHandler(id: ModuleIdentifier, options?: BridgeUnexposeOptions | undefined): Promise<Address[]> {
    const filterOptions: ModuleFilterOptions = { direction: options?.direction }
    const module = await super.resolve(id, filterOptions)
    if (module) {
      const host = assertEx(this.busHost(), () => 'Not configured as a host')
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
        resolver: this.upResolver,
      })
    }
    return this._busClient
  }

  protected busHost() {
    if (!this._busHost && this.config.host) {
      this._busHost = new AsyncQueryBusHost({
        config: this.config.host,
        logger: this.logger,
        resolver: this.upResolver,
      })
    }
    return this._busHost
  }

  protected override async discoverRoots(): Promise<ModuleInstance[]> {
    const rootInstances = (await Promise.all(this.roots.map(async (root) => await this.resolver.resolve<ModuleInstance>(root)))).filter(exists)
    for (const instance of rootInstances) {
      this.downResolver.add(instance)
    }
    return rootInstances
  }

  protected override stopHandler(_timeout?: number | undefined) {
    this.busHost()?.stop()
    return true
  }
}

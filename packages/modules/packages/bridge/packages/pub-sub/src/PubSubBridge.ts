import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { BridgeExposeOptions, BridgeModule, BridgeUnexposeOptions } from '@xyo-network/bridge-model'
import { creatableModule, ModuleFilterOptions, ModuleIdentifier, ModuleInstance, ModuleResolverInstance } from '@xyo-network/module-model'
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

  override get resolver(): ModuleResolverInstance {
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

  override async discoverRoots(): Promise<ModuleInstance[]> {
    const rootInstances = (await Promise.all(this.roots.map(async (root) => await this.resolver.resolve<ModuleInstance>(root)))).filter(exists)
    for (const instance of rootInstances) {
      this.downResolver.add(instance)
    }
    return rootInstances
  }

  async exposeHandler(id: ModuleIdentifier, options?: BridgeExposeOptions | undefined): Promise<ModuleInstance[]> {
    const { maxDepth = 2, direction = 'all', required = true } = options ?? {}
    const host = assertEx(this.busHost(), () => 'Not configured as a host')
    const module = await host.expose(id, { required })
    if (module) {
      const children = maxDepth > 0 ? await module.resolve('*', { direction, maxDepth, visibility: 'public' }) : []
      const exposedChildren = (
        await Promise.all(children.map((child) => this.exposeHandler(child.address, { maxDepth: maxDepth - 1, required: false })))
      )
        .flat()
        .filter(exists)
      return [module, ...exposedChildren]
    }
    return []
  }

  exposedHandler(): Address[] {
    const exposedSet = this.busHost()?.exposedAddresses
    return exposedSet ? [...exposedSet] : []
  }

  override async startHandler(): Promise<boolean> {
    this.busHost()?.start()
    return await super.startHandler()
  }

  async unexposeHandler(id: ModuleIdentifier, options?: BridgeUnexposeOptions | undefined): Promise<ModuleInstance[]> {
    const { maxDepth = 2, direction = 'all', required = true } = options ?? {}
    const host = assertEx(this.busHost(), () => 'Not configured as a host')
    const module = await host.unexpose(id, required)
    if (module) {
      const children = maxDepth > 0 ? await module.resolve('*', { direction, maxDepth, visibility: 'public' }) : []
      const exposedChildren = (
        await Promise.all(children.map((child) => this.unexposeHandler(child.address, { maxDepth: maxDepth - 1, required: false })))
      )
        .flat()
        .filter(exists)
      return [module, ...exposedChildren]
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

  protected override stopHandler(_timeout?: number | undefined) {
    this.busHost()?.stop()
    return true
  }
}

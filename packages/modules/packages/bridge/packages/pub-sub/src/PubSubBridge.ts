import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { forget } from '@xylabs/forget'
import { Address } from '@xylabs/hex'
import { toJsonString } from '@xylabs/object'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import {
  BridgeExposeOptions,
  BridgeModule,
  BridgeUnexposeOptions,
  QueryFulfillFinishedEventArgs,
  QueryFulfillStartedEventArgs,
  QuerySendFinishedEventArgs,
  QuerySendStartedEventArgs,
} from '@xyo-network/bridge-model'
import { creatableModule, ModuleIdentifier, ModuleInstance, resolveAddressToInstanceUp, ResolveHelper } from '@xyo-network/module-model'
import { asNodeInstance } from '@xyo-network/node-model'
import { isPayloadOfSchemaType, Schema } from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

import { AsyncQueryBusClient, AsyncQueryBusHost } from './AsyncQueryBus'
import { PubSubBridgeConfigSchema } from './Config'
import { PubSubBridgeParams } from './Params'
import { PubSubBridgeModuleResolver } from './PubSubBridgeModuleResolver'

const moduleName = 'PubSubBridge'

@creatableModule()
export class PubSubBridge<TParams extends PubSubBridgeParams = PubSubBridgeParams> extends AbstractBridge<TParams> implements BridgeModule<TParams> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, PubSubBridgeConfigSchema]
  static override readonly defaultConfigSchema: Schema = PubSubBridgeConfigSchema

  protected _configRootAddress: Address = ''
  protected _configStateStoreArchivist: string = ''
  protected _configStateStoreBoundWitnessDiviner: string = ''
  protected _exposedAddresses: Address[] = []
  protected _lastState?: LRUCache<string, number>

  private _busClient?: AsyncQueryBusClient
  private _busHost?: AsyncQueryBusHost
  private _resolver?: PubSubBridgeModuleResolver

  override get resolver(): PubSubBridgeModuleResolver {
    this._resolver =
      this._resolver ??
      new PubSubBridgeModuleResolver({
        bridge: this,
        busClient: assertEx(this.busClient(), () => 'busClient not configured'),
        onQuerySendFinished: (args: Omit<QuerySendFinishedEventArgs, 'module'>) => {
          forget(this.emit('querySendFinished', { module: this, ...args }))
        },
        onQuerySendStarted: (args: Omit<QuerySendStartedEventArgs, 'module'>) => {
          forget(this.emit('querySendStarted', { module: this, ...args }))
        },
        root: this,
        wrapperAccount: this.account,
      })
    return this._resolver
  }

  protected get moduleName() {
    return `${this.config.name ?? moduleName}`
  }

  async connect(id: ModuleIdentifier, maxDepth = 5): Promise<Address | undefined> {
    const transformedId = assertEx(await ResolveHelper.transformModuleIdentifier(id), () => `Unable to transform module identifier: ${id}`)
    //check if already connected
    const existingInstance = await this.resolve<ModuleInstance>(transformedId)
    if (existingInstance) {
      return existingInstance.address
    }

    //use the resolver to create the proxy instance
    const result = await this.resolver.resolveHandler<ModuleInstance>(id)
    const instance = Array.isArray(result) ? result[0] : result
    return await this.connectInstance(instance, maxDepth)
  }

  async disconnect(id: ModuleIdentifier): Promise<Address | undefined> {
    const transformedId = assertEx(await ResolveHelper.transformModuleIdentifier(id), () => `Unable to transform module identifier: ${id}`)
    const instance = await this.resolve<ModuleInstance>(transformedId)
    if (instance) {
      this.downResolver.remove(instance.address)
      return instance.address
    }
  }

  override async discoverRoots(): Promise<ModuleInstance[]> {
    const rootAddresses = (await Promise.all((this.config.roots ?? []).map((id) => ResolveHelper.transformModuleIdentifier(id)))).filter(exists)
    const rootInstances = (await Promise.all(rootAddresses.map(async (root) => await this.resolver.resolve<ModuleInstance>(root)))).filter(exists)
    for (const instance of rootInstances) {
      this.downResolver.add(instance)
    }
    this._roots = rootInstances
    return rootInstances
  }

  async exposeChild(mod: ModuleInstance, options?: BridgeExposeOptions | undefined): Promise<ModuleInstance[]> {
    const { maxDepth = 5 } = options ?? {}
    const host = assertEx(this.busHost(), () => 'Not configured as a host')
    host.expose(mod)
    const children = maxDepth > 0 ? (await mod.publicChildren?.()) ?? [] : []
    this.logger.log(`childrenToExpose [${mod.id}][${mod.address}]: ${toJsonString(children.map((child) => child.id))}`)
    const exposedChildren = (await Promise.all(children.map((child) => this.exposeChild(child, { maxDepth: maxDepth - 1, required: false }))))
      .flat()
      .filter(exists)
    const allExposed = [mod, ...exposedChildren]

    for (const exposedMod of allExposed) this.logger?.log(`exposed: ${exposedMod.address} [${mod.id}]`)

    return allExposed
  }

  async exposeHandler(address: Address, options?: BridgeExposeOptions | undefined): Promise<ModuleInstance[]> {
    const { required = true } = options ?? {}
    const mod = await resolveAddressToInstanceUp(this, address)
    if (required && !mod) {
      throw new Error(`Unable to find required module: ${address}`)
    }
    if (mod) {
      return this.exposeChild(mod, options)
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
    const { maxDepth = 2, required = true } = options ?? {}
    const host = assertEx(this.busHost(), () => 'Not configured as a host')
    const module = await host.unexpose(id, required)
    if (module) {
      const children = maxDepth > 0 ? (await module.publicChildren?.()) ?? [] : []
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
        rootModule: this,
      })
    }
    return this._busClient
  }

  protected busHost() {
    if (!this._busHost && this.config.host) {
      this._busHost = new AsyncQueryBusHost({
        config: this.config.host,
        logger: this.logger,
        onQueryFulfillFinished: (args: Omit<QueryFulfillFinishedEventArgs, 'module'>) => {
          forget(this.emit('queryFulfillFinished', { module: this, ...args }))
        },
        onQueryFulfillStarted: (args: Omit<QueryFulfillStartedEventArgs, 'module'>) => {
          forget(this.emit('queryFulfillStarted', { module: this, ...args }))
        },
        rootModule: this,
      })
    }
    return this._busHost
  }

  protected async connectInstance(instance?: ModuleInstance, maxDepth = 5): Promise<Address | undefined> {
    if (instance) {
      this.downResolver.add(instance)
      if (maxDepth > 0) {
        const node = asNodeInstance(instance)
        if (node) {
          const state = await node.state()
          const children = (state?.filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema)).map((s) => s.address) ?? []).filter(
            (a) => a !== instance.address,
          )
          await Promise.all(children.map((child) => this.connect(child, maxDepth - 1)))
        }
      }
      this.logger?.log(`Connect: ${instance.config.name ?? instance.address}`)
      return instance.address
    }
  }

  protected override stopHandler(_timeout?: number | undefined) {
    this.busHost()?.stop()
    return true
  }
}

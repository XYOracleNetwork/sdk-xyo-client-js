import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { forget } from '@xylabs/forget'
import { Address, isAddress } from '@xylabs/hex'
import { toJsonString } from '@xylabs/object'
import { AbstractBridge } from '@xyo-network/bridge-abstract'
import {
  BridgeExposeOptions,
  BridgeModule,
  BridgeUnexposeOptions,
  QueryFulfillFinishedEventArgs,
  QueryFulfillStartedEventArgs,
  QuerySendFinishedEventArgs,
  QuerySendStartedEventArgs,
} from '@xyo-network/bridge-model'
import {
  AddressPayload,
  AddressSchema,
  creatableModule,
  isAddressModuleFilter,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  resolveAddressToInstance,
  resolveAddressToInstanceUp,
  ResolveHelper,
} from '@xyo-network/module-model'
import { asNodeInstance } from '@xyo-network/node-model'
import { isPayloadOfSchemaType, Schema } from '@xyo-network/payload-model'
import { Mutex } from 'async-mutex'
import { LRUCache } from 'lru-cache'

import { AsyncQueryBusClient, AsyncQueryBusHost } from './AsyncQueryBus/index.ts'
import { PubSubBridgeConfigSchema } from './Config.ts'
import { PubSubBridgeParams } from './Params.ts'
import { PubSubBridgeModuleResolver } from './PubSubBridgeModuleResolver.ts'

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
  private _discoverRootsMutex = new Mutex()
  private _resolver?: PubSubBridgeModuleResolver

  override get resolver(): PubSubBridgeModuleResolver {
    this._resolver
      = this._resolver
        ?? new PubSubBridgeModuleResolver({
          additionalSigners: this.additionalSigners,
          archiving: { ...this.archiving, resolveArchivists: this.resolveArchivingArchivists.bind(this) },
          bridge: this,
          busClient: assertEx(this.busClient(), () => 'busClient not configured'),
          onQuerySendFinished: (args: Omit<QuerySendFinishedEventArgs, 'mod'>) => {
            forget(this.emit('querySendFinished', { mod: this, ...args }))
          },
          onQuerySendStarted: (args: Omit<QuerySendStartedEventArgs, 'mod'>) => {
            forget(this.emit('querySendStarted', { mod: this, ...args }))
          },
          root: this,
          wrapperAccount: this.account,
        })
    return this._resolver
  }

  protected get moduleName() {
    return this.modName ?? moduleName
  }

  async connect(id: ModuleIdentifier, maxDepth = 5): Promise<Address | undefined> {
    const transformedId = assertEx(await ResolveHelper.transformModuleIdentifier(id), () => `Unable to transform module identifier: ${id}`)
    // check if already connected
    const existingInstance = await this.resolve<ModuleInstance>(transformedId)
    if (existingInstance) {
      return existingInstance.address
    }

    // use the resolver to create the proxy instance
    const [instance] = await this.resolver.resolveHandler<ModuleInstance>(id)
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

  async exposeChild(mod: ModuleInstance, options?: BridgeExposeOptions | undefined): Promise<ModuleInstance[]> {
    const { maxDepth = 5 } = options ?? {}
    console.log(`exposeChild: ${mod.address} ${mod?.id} ${maxDepth}`)
    const host = assertEx(this.busHost(), () => 'Not configured as a host')
    host.expose(mod)
    const children = maxDepth > 0 ? ((await mod.publicChildren?.()) ?? []) : []
    this.logger.log(`childrenToExpose [${mod.id}][${mod.address}]: ${toJsonString(children.map(child => child.id))}`)
    const exposedChildren = (await Promise.all(children.map(child => this.exposeChild(child, { maxDepth: maxDepth - 1, required: false }))))
      .flat()
      .filter(exists)
    const allExposed = [mod, ...exposedChildren]

    for (const exposedMod of allExposed) this.logger?.log(`exposed: ${exposedMod.address} [${mod.id}]`)

    return allExposed
  }

  async exposeHandler(address: Address, options?: BridgeExposeOptions | undefined): Promise<ModuleInstance[]> {
    const { required = true } = options ?? {}
    const mod = await resolveAddressToInstanceUp(this, address)
    console.log(`exposeHandler: ${address} ${mod?.id}`)
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

  async getRoots(force?: boolean): Promise<ModuleInstance[]> {
    return await this._discoverRootsMutex.runExclusive(async () => {
      if (this._roots === undefined || force) {
        const rootAddresses = (
          await Promise.all(
            (this.config.roots ?? []).map((id) => {
              try {
                return ResolveHelper.transformModuleIdentifier(id)
              } catch (ex) {
                this.logger?.warn('Unable to transform module identifier:', id, ex)
                return
              }
            }),
          )
        ).filter(exists)
        const rootInstances = (
          await Promise.all(
            rootAddresses.map(async (root) => {
              try {
                return await this.resolver.resolveHandler<ModuleInstance>(root)
              } catch (ex) {
                this.logger?.warn('Unable to resolve root:', root, ex)
                return
              }
            }),
          )
        )
          .flat()
          .filter(exists)
        for (const instance of rootInstances) {
          this.downResolver.add(instance)
        }
        this._roots = rootInstances
      }
      return this._roots
    })
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  override async resolve(): Promise<ModuleInstance[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(filter: ModuleFilter, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  /** @deprecated use '*' if trying to resolve all */
  override async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter, options?: ModuleFilterOptions<T>): Promise<T[]>

  override async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleFilter<T> | ModuleIdentifier = '*',
    options: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    const roots = (this._roots ?? []) as T[]
    const workingSet = (options.direction === 'up' ? [this as ModuleInstance] : [...roots, this]) as T[]
    if (idOrFilter === '*') {
      const remainingDepth = (options.maxDepth ?? 1) - 1
      return remainingDepth <= 0
        ? workingSet
        : (
            [...workingSet, ...(await Promise.all(roots.map(mod => mod.resolve('*', { ...options, maxDepth: remainingDepth })))).flat()]
          )
    }
    switch (typeof idOrFilter) {
      case 'string': {
        const parts = idOrFilter.split(':')
        const first = assertEx(parts.shift(), () => 'Missing first part')
        const firstInstance: ModuleInstance | undefined
          = isAddress(first)
            ? ((await resolveAddressToInstance(this, first, undefined, [], options.direction)) as T)
            : this._roots?.find(mod => mod.id === first)
        return (parts.length === 0 ? firstInstance : firstInstance?.resolve(parts.join(':'), options)) as T | undefined
      }
      case 'object': {
        const results: T[] = []
        if (isAddressModuleFilter(idOrFilter)) {
          for (const mod of workingSet) {
            if (mod.modName && idOrFilter.address.includes(mod.address)) results.push(mod as T)
          }
        }
        return results
      }
      default: {
        return
      }
    }
  }

  override async startHandler(): Promise<boolean> {
    this.busHost()?.start()
    return await super.startHandler()
  }

  async unexposeHandler(id: ModuleIdentifier, options?: BridgeUnexposeOptions | undefined): Promise<ModuleInstance[]> {
    const { maxDepth = 2, required = true } = options ?? {}
    const host = assertEx(this.busHost(), () => 'Not configured as a host')
    const mod = await host.unexpose(id, required)
    if (mod) {
      const children = maxDepth > 0 ? ((await mod.publicChildren?.()) ?? []) : []
      const exposedChildren = (
        await Promise.all(children.map(child => this.unexposeHandler(child.address, { maxDepth: maxDepth - 1, required: false })))
      )
        .flat()
        .filter(exists)
      return [mod, ...exposedChildren]
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
        onQueryFulfillFinished: (args: Omit<QueryFulfillFinishedEventArgs, 'mod'>) => {
          if (this.archiving && this.isAllowedArchivingQuery(args.query.schema)) {
            forget(this.storeToArchivists(args.result?.flat() ?? []))
          }
          forget(this.emit('queryFulfillFinished', { mod: this, ...args }))
        },
        onQueryFulfillStarted: (args: Omit<QueryFulfillStartedEventArgs, 'mod'>) => {
          if (this.archiving && this.isAllowedArchivingQuery(args.query.schema)) {
            forget(this.storeToArchivists([args.query, ...(args.payloads ?? [])]))
          }
          forget(this.emit('queryFulfillStarted', { mod: this, ...args }))
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
          const children = (state?.filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema)).map(s => s.address) ?? []).filter(
            a => a !== instance.address,
          )
          await Promise.all(children.map(child => this.connect(child, maxDepth - 1)))
        }
      }
      this.logger?.log(`Connect: ${instance.id}`)
      return instance.address
    }
  }

  protected override stopHandler(_timeout?: number | undefined) {
    this.busHost()?.stop()
    return true
  }
}

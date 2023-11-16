import { handleError } from '@xylabs/error'
import { compact } from '@xylabs/lodash'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { isArchivistModule } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BridgeModule } from '@xyo-network/bridge-model'
import { DivinerWrapper } from '@xyo-network/diviner'
import { isDivinerModule } from '@xyo-network/diviner-model'
import {
  AddressModuleFilter,
  Module,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleInstance,
  ModuleResolver,
  NameModuleFilter,
  QueryModuleFilter,
} from '@xyo-network/module-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'
import { ModuleWrapper } from '@xyo-network/module-wrapper'
import { isNodeModule } from '@xyo-network/node-model'
import { NodeWrapper } from '@xyo-network/node-wrapper'
import { isSentinelModule, SentinelWrapper } from '@xyo-network/sentinel'
import { isWitnessModule } from '@xyo-network/witness-model'
import { WitnessWrapper } from '@xyo-network/witness-wrapper'

import { ProxyModule, ProxyModuleConfigSchema, ProxyModuleParams } from './ProxyModule'

export class BridgeModuleResolver<T extends ModuleInstance = ModuleInstance> extends CompositeModuleResolver implements ModuleResolver {
  private primed: Promise<boolean> | undefined = undefined
  private remoteAddresses?: Promise<string[]>
  private resolvedModules: Record<string, Promise<ModuleInstance>> = {}

  // TODO: Allow optional ctor param for supplying address for nested Nodes
  // protected readonly address?: string,
  constructor(
    protected readonly bridge: BridgeModule,
    protected wrapperAccount: AccountInstance,
    protected options?: ModuleFilterOptions<T>,
  ) {
    super()
  }

  override get isModuleResolver(): boolean {
    return true
  }

  override add(module: Module): this
  override add(module: Module[]): this
  override add(_module: Module | Module[]): this {
    throw new Error('Method not implemented.')
  }

  async currentResolvedModules<T extends ModuleInstance = ModuleInstance>(): Promise<Record<string, T>> {
    const result: Record<string, T> = {}
    await Promise.all(
      Object.entries(this.resolvedModules).map(async ([key, value]) => {
        result[key] = (await value) as T
      }),
    )

    return result
  }

  async getRemoteAddresses() {
    this.remoteAddresses =
      this.remoteAddresses ??
      (async () => {
        const discover = await this.bridge.targetDiscover(undefined, this.options?.maxDepth)
        return compact(
          discover?.map((payload) => {
            if (payload.schema === AddressSchema) {
              const schemaPayload = payload as AddressPayload
              return schemaPayload.address
            } else {
              return null
            }
          }),
        )
      })()
    return await this.remoteAddresses
  }

  prime() {
    this.primed =
      this.primed ??
      (async () => {
        await this.resolveRemoteModules()
        return true
      })()
    return this.primed
  }

  override remove(_address: string | string[]): this {
    throw new Error('Method not implemented.')
  }

  reset() {
    this.primed = undefined
    this.remoteAddresses = undefined
    this.resolvedModules = {}
  }

  override async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(nameOrAddress: string, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  override async resolve<T extends ModuleInstance = ModuleInstance>(
    nameOrAddressOrFilter?: ModuleFilter<T> | string,
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    const unfiltered = await (async () => {
      const mutatedOptions = { ...options, maxDepth: (options?.maxDepth ?? BridgeModuleResolver.defaultMaxDepth) - 1 }
      await this.prime()
      await this.resolveRemoteModules()
      if (typeof nameOrAddressOrFilter === 'string') {
        if (mutatedOptions.maxDepth < 0) {
          return undefined
        }
        const result: T | undefined = (await this.resolveByAddress<T>(nameOrAddressOrFilter)) ?? (await this.resolveByName<T>(nameOrAddressOrFilter))
        return result
      } else {
        if (mutatedOptions.maxDepth < 0) {
          return []
        }
        const result: T[] = await this.resolveRemoteModules<T>(nameOrAddressOrFilter)
        return result
      }
    })()

    const identity = options?.identity
    if (identity) {
      return Array.isArray(unfiltered) ? unfiltered?.filter((module) => identity(module)) : identity(unfiltered) ? unfiltered : undefined
    } else {
      return unfiltered
    }
  }

  private async resolveByAddress<T extends ModuleInstance = ModuleInstance>(targetAddress: string): Promise<T | undefined> {
    const remoteAddresses = await this.getRemoteAddresses()

    //check if it is even there
    if (!remoteAddresses.find((address) => address === targetAddress)) {
      //this.logger?.log(`Not in RA: ${targetAddress}`)
      return undefined
    }

    const cached = this.resolvedModules[targetAddress]
    if (cached) return (await cached) as T

    this.resolvedModules[targetAddress] =
      this.resolvedModules[targetAddress] ??
      (async (address: string) => {
        //discover it to set the config in the bridge
        await this.bridge.targetDiscover(address)

        const mod: Module = new ProxyModule({ address, bridge: this.bridge, config: { schema: ProxyModuleConfigSchema } } as ProxyModuleParams)

        try {
          if (isArchivistModule(mod)) {
            return ArchivistWrapper.wrap(mod, this.wrapperAccount)
          }

          if (isDivinerModule(mod)) {
            return DivinerWrapper.wrap(mod, this.wrapperAccount)
          }

          if (isWitnessModule(mod)) {
            return WitnessWrapper.wrap(mod, this.wrapperAccount)
          }

          if (isNodeModule(mod)) {
            return NodeWrapper.wrap(mod, this.wrapperAccount)
          }

          if (isSentinelModule(mod)) {
            return SentinelWrapper.wrap(mod, this.wrapperAccount)
          }
          console.warn(`BridgeModuleResolver: Unknown Module Type: [${targetAddress}]`)
          return ModuleWrapper.wrap(mod, this.wrapperAccount)
        } catch (ex) {
          handleError(ex, (error) => {
            console.error(`BridgeModuleResolver.resolveByAddress: ${error.message} [${targetAddress}]`)
          })
        }
      })(targetAddress)

    return (await this.resolvedModules[targetAddress]) as T
  }

  private async resolveByName<T extends ModuleInstance = ModuleInstance>(name: string): Promise<T | undefined> {
    const modules = await this.currentResolvedModules()
    return Object.values(modules)
      .filter((module) => module.config.name === name)
      .pop() as T
  }

  private async resolveByQuery<T extends ModuleInstance = ModuleInstance>(queries: string[]): Promise<T[]> {
    return Object.values(await this.currentResolvedModules()).filter((module) => {
      //filter out the requested queries
      const found = module.queries.filter((query) => queries.find((q) => q === query))

      //did we find all the requested queries?
      return queries.length === found.length
    }) as T[]
  }

  private async resolveRemoteModules<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter): Promise<T[]> {
    if ((filter as AddressModuleFilter)?.address) {
      return await this.resolveRemoteModulesByAddress<T>(filter as AddressModuleFilter)
    }

    if ((filter as NameModuleFilter)?.name) {
      return await this.resolveRemoteModulesByName<T>(filter as NameModuleFilter)
    }

    if ((filter as QueryModuleFilter)?.query) {
      return await this.resolveRemoteModulesByQuery<T>(filter as QueryModuleFilter)
    }

    //get all of them
    return await this.resolveRemoteModulesByAddress<T>({ address: await this.getRemoteAddresses() })
  }

  private async resolveRemoteModulesByAddress<T extends ModuleInstance = ModuleInstance>(filter: AddressModuleFilter): Promise<T[]> {
    return compact(await Promise.all(filter.address.map((address) => this.resolveByAddress<T>(address))))
  }

  private async resolveRemoteModulesByName<T extends ModuleInstance = ModuleInstance>(filter: NameModuleFilter): Promise<T[]> {
    return compact(await Promise.all(filter.name.map(async (name) => await this.resolveByName<T>(name))))
  }

  private async resolveRemoteModulesByQuery<T extends ModuleInstance = ModuleInstance>(filter: QueryModuleFilter): Promise<T[]> {
    return compact((await Promise.all(filter.query.map(async (query) => await this.resolveByQuery<T>(query)))).flat())
  }
}

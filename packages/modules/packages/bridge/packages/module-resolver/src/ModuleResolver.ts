import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { isArchivistModule } from '@xyo-network/archivist-model'
import { IndirectArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BridgeModule } from '@xyo-network/bridge-model'
import { IndirectDivinerWrapper } from '@xyo-network/diviner'
import { isDivinerModule } from '@xyo-network/diviner-model'
import { handleError } from '@xyo-network/error'
import { CompositeModuleResolver, ModuleWrapper } from '@xyo-network/module'
import {
  AddressModuleFilter,
  IndirectModule,
  Module,
  ModuleFilter,
  ModuleResolver,
  NameModuleFilter,
  QueryModuleFilter,
} from '@xyo-network/module-model'
import { isNodeModule } from '@xyo-network/node-model'
import { NodeWrapper } from '@xyo-network/node-wrapper'
import { isSentinelModule, SentinelWrapper } from '@xyo-network/sentinel'
import { isWitnessModule } from '@xyo-network/witness-model'
import { WitnessWrapper } from '@xyo-network/witness-wrapper'
import compact from 'lodash/compact'

import { ProxyModule, ProxyModuleConfigSchema, ProxyModuleParams } from './ProxyModule'

export class BridgeModuleResolver extends CompositeModuleResolver implements ModuleResolver {
  private remoteAddresses?: Promise<string[]>
  private resolvedModules: Record<string, Promise<Module>> = {}

  // TODO: Allow optional ctor param for supplying address for nested Nodes
  // protected readonly address?: string,
  constructor(protected readonly bridge: BridgeModule, protected wrapperAccount: AccountInstance) {
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

  async currentResolvedModules<T extends Module = Module>(): Promise<Record<string, T>> {
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
        const discover = await this.bridge.targetDiscover()
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

  override remove(_address: string | string[]): this {
    throw new Error('Method not implemented.')
  }

  override async resolve<TModule extends IndirectModule = IndirectModule>(filter?: ModuleFilter): Promise<TModule[]>
  override async resolve<TModule extends IndirectModule = IndirectModule>(nameOrAddress: string): Promise<TModule | undefined>
  override async resolve<TModule extends IndirectModule = IndirectModule>(
    nameOrAddressOrFilter?: ModuleFilter | string,
  ): Promise<TModule | TModule[] | undefined> {
    if (typeof nameOrAddressOrFilter === 'string') {
      return (await this.resolveByAddress<TModule>(nameOrAddressOrFilter)) ?? (await this.resolveByName<TModule>(nameOrAddressOrFilter))
    } else {
      return await this.resolveRemoteModules<TModule>(nameOrAddressOrFilter)
    }
  }

  private async resolveByAddress<T extends Module = Module>(targetAddress: string): Promise<T | undefined> {
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
        const mod: Module = new ProxyModule({ address, bridge: this.bridge, config: { schema: ProxyModuleConfigSchema } } as ProxyModuleParams)

        try {
          //discover it to set the config in the bridge
          await this.bridge.targetDiscover(address)

          if (isArchivistModule(mod)) {
            return IndirectArchivistWrapper.wrap(mod, this.wrapperAccount)
          }

          if (isDivinerModule(mod)) {
            return IndirectDivinerWrapper.wrap(mod, this.wrapperAccount)
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
          console.warn(`BridgeModuleResolver: Unknown Module Type: [${targetAddress}: ${mod.config.schema}]`)
          return ModuleWrapper.wrap(mod, this.wrapperAccount)
        } catch (ex) {
          handleError(ex, (error) => {
            console.error(`BridgeModuleResolver.resolveByAddress: ${error.message} [${targetAddress}]`)
          })
        }
      })(targetAddress)

    return (await this.resolvedModules[targetAddress]) as T
  }

  private async resolveByName<T extends Module = Module>(name: string): Promise<T[]> {
    return Object.values(await this.currentResolvedModules<T>()).filter((module) => module.config.name === name)
  }

  private async resolveByQuery<T extends Module = Module>(queries: string[]): Promise<T[]> {
    return Object.values(await this.currentResolvedModules<T>()).filter((module) => {
      //filter out the requested queries
      const found = module.queries.filter((query) => queries.find((q) => q === query))

      //did we find all the requested queries?
      return queries.length === found.length
    })
  }

  private async resolveRemoteModules<T extends Module = Module>(filter?: ModuleFilter): Promise<T[]> {
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

  private async resolveRemoteModulesByAddress<T extends Module = Module>(filter: AddressModuleFilter): Promise<T[]> {
    return compact(await Promise.all(filter.address.map((address) => this.resolveByAddress<T>(address))))
  }

  private async resolveRemoteModulesByName<T extends Module = Module>(filter: NameModuleFilter): Promise<T[]> {
    return compact((await Promise.all(filter.name.map(async (name) => await this.resolveByName<T>(name)))).flat())
  }

  private async resolveRemoteModulesByQuery<T extends Module = Module>(filter: QueryModuleFilter): Promise<T[]> {
    return compact((await Promise.all(filter.query.map(async (query) => await this.resolveByQuery<T>(query)))).flat())
  }
}

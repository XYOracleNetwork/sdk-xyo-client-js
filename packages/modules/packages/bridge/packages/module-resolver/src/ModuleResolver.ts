import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { isArchivistModule } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BridgeModule } from '@xyo-network/bridge-model'
import { DivinerWrapper } from '@xyo-network/diviner'
import { isDivinerModule } from '@xyo-network/diviner-model'
import { handleError } from '@xyo-network/error'
import { CompositeModuleResolver, ModuleWrapper } from '@xyo-network/module'
import {
  AddressModuleFilter,
  Module,
  ModuleFilter,
  ModuleInstance,
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
  private primed: Promise<boolean> | undefined = undefined
  private remoteAddresses?: Promise<string[]>
  private resolvedModules: Record<string, Promise<ModuleInstance>> = {}

  // TODO: Allow optional ctor param for supplying address for nested Nodes
  // protected readonly address?: string,
  constructor(
    protected readonly bridge: BridgeModule,
    protected wrapperAccount: AccountInstance,
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

  override async resolve(filter?: ModuleFilter): Promise<ModuleInstance[]>
  override async resolve(nameOrAddress: string): Promise<ModuleInstance | undefined>
  override async resolve(nameOrAddressOrFilter?: ModuleFilter | string): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    await this.prime()
    await this.resolveRemoteModules()
    if (typeof nameOrAddressOrFilter === 'string') {
      const result: ModuleInstance | undefined =
        (await this.resolveByAddress(nameOrAddressOrFilter)) ?? (await this.resolveByName(nameOrAddressOrFilter))
      return result
    } else {
      const result: ModuleInstance[] = await this.resolveRemoteModules(nameOrAddressOrFilter)
      return result
    }
  }

  private async resolveByAddress(targetAddress: string): Promise<ModuleInstance | undefined> {
    const remoteAddresses = await this.getRemoteAddresses()

    //check if it is even there
    if (!remoteAddresses.find((address) => address === targetAddress)) {
      //this.logger?.log(`Not in RA: ${targetAddress}`)
      return undefined
    }

    const cached = this.resolvedModules[targetAddress]
    if (cached) return await cached

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

    return await this.resolvedModules[targetAddress]
  }

  private async resolveByName(name: string): Promise<ModuleInstance | undefined> {
    const modules = await this.currentResolvedModules()
    return Object.values(modules)
      .filter((module) => module.config.name === name)
      .pop()
  }

  private async resolveByQuery(queries: string[]): Promise<ModuleInstance[]> {
    return Object.values(await this.currentResolvedModules()).filter((module) => {
      //filter out the requested queries
      const found = module.queries.filter((query) => queries.find((q) => q === query))

      //did we find all the requested queries?
      return queries.length === found.length
    })
  }

  private async resolveRemoteModules(filter?: ModuleFilter): Promise<ModuleInstance[]> {
    if ((filter as AddressModuleFilter)?.address) {
      return await this.resolveRemoteModulesByAddress(filter as AddressModuleFilter)
    }

    if ((filter as NameModuleFilter)?.name) {
      return await this.resolveRemoteModulesByName(filter as NameModuleFilter)
    }

    if ((filter as QueryModuleFilter)?.query) {
      return await this.resolveRemoteModulesByQuery(filter as QueryModuleFilter)
    }

    //get all of them
    return await this.resolveRemoteModulesByAddress({ address: await this.getRemoteAddresses() })
  }

  private async resolveRemoteModulesByAddress(filter: AddressModuleFilter): Promise<ModuleInstance[]> {
    return compact(await Promise.all(filter.address.map((address) => this.resolveByAddress(address))))
  }

  private async resolveRemoteModulesByName(filter: NameModuleFilter): Promise<ModuleInstance[]> {
    return compact(await Promise.all(filter.name.map(async (name) => await this.resolveByName(name))))
  }

  private async resolveRemoteModulesByQuery(filter: QueryModuleFilter): Promise<ModuleInstance[]> {
    return compact((await Promise.all(filter.query.map(async (query) => await this.resolveByQuery(query)))).flat())
  }
}

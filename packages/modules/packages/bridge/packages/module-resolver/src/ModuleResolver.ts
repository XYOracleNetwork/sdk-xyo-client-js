import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { BridgeModule } from '@xyo-network/bridge-model'
import { CompositeModuleResolver } from '@xyo-network/module'
import { AddressModuleFilter, Module, ModuleFilter, NameModuleFilter, QueryModuleFilter } from '@xyo-network/module-model'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'

import { ProxyModule } from './ProxyModule'

export class BridgeModuleResolver extends CompositeModuleResolver {
  private resolvedModules: Record<string, Promise<ProxyModule>> = {}

  // TODO: Allow optional ctor param for supplying address for nested Nodes
  // protected readonly address?: string,
  constructor(protected readonly bridge: BridgeModule) {
    super()
  }

  public get isModuleResolver(): boolean {
    return true
  }

  add(module: Module): this
  add(module: Module[]): this
  add(_module: Module | Module[]): this {
    throw new Error('Method not implemented.')
  }

  async currentResolvedModules(): Promise<Record<string, ProxyModule>> {
    const result: Record<string, ProxyModule> = {}
    await Promise.all(
      Object.entries(this.resolvedModules).map(async ([key, value]) => {
        result[key] = await value
      }),
    )

    return result
  }

  remove(_address: string | string[]): this {
    throw new Error('Method not implemented.')
  }

  async resolve(filter?: ModuleFilter): Promise<ProxyModule[]> {
    return await Promise.all(flatten(await this.resolveRemoteModules(filter)))
  }

  private async getRemoteAddresses() {
    const discover = await this.bridge.targetDiscover()
    return compact(
      discover.map((payload) => {
        if (payload.schema === AddressSchema) {
          const schemaPayload = payload as AddressPayload
          return schemaPayload.address
        } else {
          return null
        }
      }),
    )
  }

  private async resolveByAddress(targetAddress: string): Promise<ProxyModule | undefined> {
    const cached = this.resolvedModules[targetAddress]
    if (cached) return await cached

    this.resolvedModules[targetAddress] =
      this.resolvedModules[targetAddress] ??
      (async (address: string) => {
        const mod = new ProxyModule(this.bridge, address)

        //discover it to set the config in the bridge
        await this.bridge.targetDiscover(targetAddress)

        return mod
      })(targetAddress)

    return await this.resolvedModules[targetAddress]
  }

  private async resolveByName(name: string): Promise<ProxyModule[] | undefined> {
    return Object.values(await this.currentResolvedModules()).filter((module) => module.config.name === name)
  }

  private async resolveByQuery(queries: string[]): Promise<ProxyModule[]> {
    return Object.values(await this.currentResolvedModules()).filter((module) => {
      //filter out the requested queries
      const found = module.queries.filter((query) => queries.find((q) => q === query))

      //did we find all the requested queries?
      return queries.length === found.length
    })
  }

  private async resolveRemoteModules(filter?: ModuleFilter): Promise<ProxyModule[]> {
    if ((filter as AddressModuleFilter)?.address) {
      return this.resolveRemoteModulesByAddress(filter as AddressModuleFilter)
    }

    if ((filter as NameModuleFilter)?.name) {
      return this.resolveRemoteModulesByName(filter as NameModuleFilter)
    }

    if ((filter as QueryModuleFilter)?.query) {
      return this.resolveRemoteModulesByQuery(filter as QueryModuleFilter)
    }

    //get all of them
    return this.resolveRemoteModulesByAddress({ address: await this.getRemoteAddresses() })
  }

  private async resolveRemoteModulesByAddress(filter: AddressModuleFilter): Promise<ProxyModule[]> {
    return compact(await Promise.all(filter.address.map((address) => this.resolveByAddress(address))))
  }

  private async resolveRemoteModulesByName(filter: NameModuleFilter): Promise<ProxyModule[]> {
    return compact((await Promise.all(filter.name.map(async (name) => await this.resolveByName(name)))).flat())
  }

  private async resolveRemoteModulesByQuery(filter: QueryModuleFilter): Promise<ProxyModule[]> {
    return compact((await Promise.all(filter.query.map(async (query) => await this.resolveByQuery(query)))).flat())
  }
}

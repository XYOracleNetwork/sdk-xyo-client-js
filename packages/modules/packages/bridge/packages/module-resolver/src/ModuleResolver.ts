import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { BridgeModule } from '@xyo-network/bridge-model'
import { CompositeModuleResolver, duplicateModules } from '@xyo-network/module'
import { AddressModuleFilter, Module, ModuleFilter, NameModuleFilter, QueryModuleFilter } from '@xyo-network/module-model'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'

import { ProxyModule } from './ProxyModule'

export class BridgeModuleResolver extends CompositeModuleResolver {
  private resolvedModules: Record<string, ProxyModule> = {}

  // TODO: Allow optional ctor param for supplying address for nested Nodes
  // protected readonly address?: string,
  constructor(protected readonly bridge: BridgeModule) {
    super()
  }

  public get isModuleResolver(): boolean {
    return true
  }

  add(module: Module, name?: string | undefined): this
  add(module: Module[], name?: string[] | undefined): this
  add(module: Module | Module[], name?: string | string[] | undefined): this
  add(_module: unknown, _name?: unknown): this {
    throw new Error('Method not implemented.')
  }

  remove(name: string | string[]): this
  remove(address: string | string[]): this
  remove(_address: unknown): this {
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

  private resolveByAddress(targetAddress: string): ProxyModule | undefined {
    const cached = this.resolvedModules[targetAddress]
    if (cached) return cached
    const mod = new ProxyModule(this.bridge, targetAddress)
    this.resolvedModules[targetAddress] = mod
    return mod
  }

  private resolveByName(name: string): ProxyModule[] | undefined {
    return Object.values(this.resolvedModules).filter((module) => module.config.name === name)
  }

  private resolveByQuery(queries: string[]): ProxyModule[] | undefined {
    return Object.values(this.resolvedModules).filter((module) => {
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

  private resolveRemoteModulesByAddress(filter: AddressModuleFilter): ProxyModule[] {
    return compact(filter.address.map((address) => this.resolveByAddress(address)))
  }

  private resolveRemoteModulesByName(filter: NameModuleFilter): ProxyModule[] {
    return compact(filter.name.map((name) => this.resolveByName(name)).flat())
  }

  private resolveRemoteModulesByQuery(filter: QueryModuleFilter): ProxyModule[] {
    return compact(filter.query.map((queries) => queries.map((query) => this.resolveByName(query)).flat()).flat())
  }
}

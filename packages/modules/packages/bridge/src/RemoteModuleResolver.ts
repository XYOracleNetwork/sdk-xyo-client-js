import { assertEx } from '@xylabs/assert'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { AbstractModule, CompositeModuleResolver, ModuleWrapper } from '@xyo-network/module'
import { Module, ModuleFilter } from '@xyo-network/module-model'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'

import { HttpBridge } from './HttpBridge'
import { HttpBridgeConfigSchema } from './HttpBridgeConfig'

interface LocalModuleFilter {
  config?: string[]
  query?: string[][]
}

interface RemoteModuleFilter {
  address?: string[]
  name?: string[]
}

export class RemoteModuleResolver extends CompositeModuleResolver {
  private resolvedModules: Record<string, HttpBridge> = {}

  // TODO: Allow optional ctor param for supplying address for nested Nodes
  // protected readonly address?: string,
  constructor(protected readonly bridge: HttpBridge) {
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

  async resolve(filter?: ModuleFilter): Promise<AbstractModule[]> {
    const mods = await Promise.all(flatten(await this.resolveRemoteModules(filter)))
    return this.filterLocalModules(mods, filter)
  }

  private filterLocalModules(mods: AbstractModule[], filter?: LocalModuleFilter): AbstractModule[] {
    // TODO: Handle filter?.query
    if (filter?.query) throw new Error('Filtering by query not yet implemented by this resolver')
    const config = filter?.config
    const filtered = config?.length ? mods.filter((mod) => config.includes(mod.config.schema)) : mods
    return filtered
  }

  private async getRemoteAddresses() {
    const nodeWrapper = assertEx(ModuleWrapper.wrap(this.bridge), 'nodeUri can not be wrapped')
    const discover = await nodeWrapper.discover()
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

  private async resolveByAddress(targetAddress: string): Promise<HttpBridge> {
    const cached = this.resolvedModules[targetAddress]
    if (cached) return cached
    const mod = await HttpBridge.create({
      config: { nodeUri: this.bridge.nodeUri, schema: HttpBridgeConfigSchema, targetAddress },
    })
    this.resolvedModules[targetAddress] = mod
    return mod
  }

  private async resolveByName(name: string): Promise<HttpBridge> {
    const cached = this.resolvedModules[name]
    if (cached) return cached
    const mod = await HttpBridge.create({
      config: { name, nodeUri: this.bridge.nodeUri, schema: HttpBridgeConfigSchema },
    })
    this.resolvedModules[name] = mod
    this.resolvedModules[mod.address] = mod
    return mod
  }

  private async resolveRemoteModules(filter?: RemoteModuleFilter): Promise<HttpBridge[]> {
    const addresses = filter ? filter?.address : await this.getRemoteAddresses()
    const names = filter?.name
    const byAddress = await Promise.all(addresses?.map((address) => this.resolveByAddress(address)) ?? [])
    const byName = await Promise.all(names?.map((name) => this.resolveByName(name)) ?? [])
    return [...byAddress, ...byName]
  }
}

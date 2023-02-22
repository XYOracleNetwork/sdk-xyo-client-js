import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { BridgeModule } from '@xyo-network/bridge-model'
import { CompositeModuleResolver } from '@xyo-network/module'
import { Module, ModuleFilter } from '@xyo-network/module-model'
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

  private resolveByName(name: string): ProxyModule | undefined {
    const cached = this.resolvedModules[name]
    if (cached) return cached
    return undefined
  }

  private async resolveRemoteModules(filter?: ModuleFilter): Promise<ProxyModule[]> {
    const addresses = filter ? filter?.address : await this.getRemoteAddresses()
    const names = filter?.name
    const byAddress = compact(await Promise.all(addresses?.map((address) => this.resolveByAddress(address)) ?? []))
    const byName = compact(await Promise.all(names?.map((name) => this.resolveByName(name)) ?? []))
    return [...byAddress, ...byName]
  }
}

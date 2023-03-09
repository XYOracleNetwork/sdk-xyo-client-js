import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { BridgeModule } from '@xyo-network/bridge-model'
import { CompositeModuleResolver } from '@xyo-network/module'
import { AddressModuleFilter, Module, ModuleFilter, NameModuleFilter, QueryModuleFilter } from '@xyo-network/module-model'
import compact from 'lodash/compact'

import { ProxyModule, ProxyModuleConfigSchema, ProxyModuleParams } from './ProxyModule'

export class BridgeModuleResolver extends CompositeModuleResolver {
  private remoteAddresses?: Promise<string[]>
  private resolvedModules: Record<string, Promise<Module>> = {}

  // TODO: Allow optional ctor param for supplying address for nested Nodes
  // protected readonly address?: string,
  constructor(protected readonly bridge: BridgeModule) {
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

  override async resolve<T extends Module = Module>(filter?: ModuleFilter): Promise<T[]> {
    return await this.resolveRemoteModules<T>(filter)
  }

  private async resolveByAddress<T extends Module = Module>(targetAddress: string): Promise<T | undefined> {
    const remoteAddresses = await this.getRemoteAddresses()

    //check if it is even there
    if (!remoteAddresses.find((address) => address === targetAddress)) {
      console.log(`Not in RA: ${targetAddress}`)
      return undefined
    }

    const cached = this.resolvedModules[targetAddress]
    if (cached) return (await cached) as T

    this.resolvedModules[targetAddress] =
      this.resolvedModules[targetAddress] ??
      (async (address: string) => {
        const mod = new ProxyModule({ address, bridge: this.bridge, config: { schema: ProxyModuleConfigSchema } } as ProxyModuleParams)

        try {
          //discover it to set the config in the bridge
          await this.bridge.targetDiscover(address)

          return mod
        } catch (ex) {
          return undefined
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

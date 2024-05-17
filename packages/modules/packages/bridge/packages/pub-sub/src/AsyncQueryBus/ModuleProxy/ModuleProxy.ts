import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { isAddress } from '@xylabs/hex'
import { AbstractModuleProxy, ModuleProxyParams } from '@xyo-network/abstract-bridge'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import {
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleName,
  ModuleQueryResult,
  ResolveHelper,
  ResolveHelperConfig,
} from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { AsyncQueryBusClient } from '../AsyncQueryBusClient'

export type AsyncQueryBusModuleProxyParams = ModuleProxyParams & {
  busClient: AsyncQueryBusClient
}

export class AsyncQueryBusModuleProxy<
    TWrappedModule extends ModuleInstance = ModuleInstance,
    TParams extends Omit<AsyncQueryBusModuleProxyParams, 'config'> & { config: TWrappedModule['config'] } = Omit<
      AsyncQueryBusModuleProxyParams,
      'config'
    > & {
      config: TWrappedModule['config']
    },
  >
  extends AbstractModuleProxy<TWrappedModule, TParams>
  implements ModuleInstance<TParams, TWrappedModule['eventData']>
{
  static createCount = 0

  constructor(params: TParams) {
    AsyncQueryBusModuleProxy.createCount = AsyncQueryBusModuleProxy.createCount + 1
    if (Math.floor(AsyncQueryBusModuleProxy.createCount / 10) === AsyncQueryBusModuleProxy.createCount / 10) {
      console.log(`AsyncQueryBusModuleProxy.createCount: ${AsyncQueryBusModuleProxy.createCount}`)
    }
    super(params)
  }

  override get id(): ModuleIdentifier {
    return this.address
  }

  override get modName(): ModuleName | undefined {
    return undefined
  }

  async proxyQueryHandler<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    return await this.params.busClient.send(this.address, query, payloads)
  }

  override async publicChildren(): Promise<ModuleInstance[]> {
    return (
      await Promise.all(
        Object.values(await this.childAddressMap())
          .filter(exists)
          .map((address) => this.resolve(address)),
      )
    ).filter(exists)
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
    const config: ResolveHelperConfig = {
      address: this.address,
      dead: this.dead,
      downResolver: this.downResolver,
      logger: this.logger,
      module: this,
      transformers: this.moduleIdentifierTransformers,
      upResolver: this.upResolver,
    }
    if (idOrFilter === '*') {
      return (await this.publicChildren()) as T[]
    }
    switch (typeof idOrFilter) {
      case 'string': {
        const parts = idOrFilter.split(':')
        const first = assertEx(parts.shift(), () => 'Missing first')
        const remainingPath = parts.join(':')
        const address = isAddress(first) ? first : this.childAddressByName(first)
        const firstInstance = (await this.params.host.resolve(address)) as ModuleInstance | undefined
        return (remainingPath ? await firstInstance?.resolve(remainingPath) : firstInstance) as T | undefined
      }
      case 'object': {
        return (await ResolveHelper.resolve(config, idOrFilter, options)).filter((mod) => mod.address !== this.address)
      }
      default: {
        return (await ResolveHelper.resolve(config, idOrFilter, options)).filter((mod) => mod.address !== this.address)
      }
    }
  }

  override async startHandler(): Promise<boolean> {
    return await super.startHandler()
  }
}

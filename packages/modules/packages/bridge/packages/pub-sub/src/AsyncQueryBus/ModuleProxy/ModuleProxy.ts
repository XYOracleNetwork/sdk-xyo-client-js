import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { forget } from '@xylabs/forget'
import { isAddress } from '@xylabs/hex'
import { isString } from '@xylabs/typeof'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import type { ModuleProxyParams } from '@xyo-network/bridge-abstract'
import { AbstractModuleProxy } from '@xyo-network/bridge-abstract'
import type {
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleName,
  ModuleQueryResult,
  ResolveHelperConfig,
} from '@xyo-network/module-model'
import { ResolveHelper } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { AsyncQueryBusClient } from '../AsyncQueryBusClient.ts'

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
  implements ModuleInstance<TParams, TWrappedModule['eventData']> {
  protected static createCount = 0

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
    if (this.archiving && this.isAllowedArchivingQuery(query.schema)) {
      forget(this.storeToArchivists([query, ...(payloads ?? [])]))
    }
    const result = await this.params.busClient.send(this.address, query, payloads)
    if (this.archiving && this.isAllowedArchivingQuery(query.schema)) {
      forget(this.storeToArchivists(result.flat()))
    }
    return result
  }

  override async publicChildren(): Promise<ModuleInstance[]> {
    return (
      await Promise.all(
        Object.keys(await this.childAddressMap())
          .filter(exists)
          .map(address => this.resolve(address)),
      )
    ).filter(exists)
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  override async resolve(): Promise<ModuleInstance[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  override async resolve<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier = '*',
    options: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    const config: ResolveHelperConfig = {
      address: this.address,
      dead: this.dead,
      downResolver: this.downResolver,
      logger: this.logger,
      mod: this,
      transformers: this.moduleIdentifierTransformers,
      upResolver: this.upResolver,
    }
    if (id === '*') {
      return (await this.publicChildren()) as T[]
    }
    switch (typeof id) {
      case 'string': {
        const parts = id.split(':')
        const first = assertEx(parts.shift(), () => 'Missing first')
        const remainingPath = parts.join(':')
        const address = isAddress(first) ? first : this.childAddressByName(first)
        if (!isAddress(address)) return undefined
        const firstInstance = (await this.params.host.resolve(address)) as ModuleInstance | undefined
        return (isString(remainingPath) ? await firstInstance?.resolve(remainingPath) : firstInstance) as T | undefined
      }
      default: {
        return (await ResolveHelper.resolve(config, id, options)).filter(mod => mod.address !== this.address)
      }
    }
  }
}

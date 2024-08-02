import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { forget } from '@xylabs/forget'
import { Address, isAddress } from '@xylabs/hex'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractModuleProxy, ModuleProxyParams } from '@xyo-network/bridge-abstract'
import {
  AttachableModuleInstance,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleQueryResult,
  ResolveHelper,
  ResolveHelperConfig,
} from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export interface BridgeQuerySender {
  sendBridgeQuery: <TOut extends Payload = Payload, TQuery extends QueryBoundWitness = QueryBoundWitness, TIn extends Payload = Payload>(
    targetAddress: Address,
    query: TQuery,
    payloads?: TIn[],
  ) => Promise<ModuleQueryResult<TOut>>
}

export type HttpModuleProxyParams = ModuleProxyParams & {
  querySender: BridgeQuerySender
}

export class HttpModuleProxy<
    TWrappedModule extends ModuleInstance = ModuleInstance,
    TParams extends Omit<HttpModuleProxyParams, 'config'> & { config: TWrappedModule['config'] } = Omit<HttpModuleProxyParams, 'config'> & {
      config: TWrappedModule['config']
    },
  >
  extends AbstractModuleProxy<TWrappedModule, TParams>
  implements AttachableModuleInstance<TParams, TWrappedModule['eventData']>
{
  static createCount = 0

  constructor(params: TParams) {
    HttpModuleProxy.createCount = HttpModuleProxy.createCount + 1
    super(params)
    if (Math.floor(HttpModuleProxy.createCount / 10) === HttpModuleProxy.createCount / 10) {
      this.logger.log(`HttpModuleProxy.createCount: ${HttpModuleProxy.createCount}`)
    }
  }

  async proxyQueryHandler<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads: Payload[] = []): Promise<ModuleQueryResult> {
    if (this.archiving && this.isAllowedArchivingQuery(query.schema)) {
      forget(this.storeToArchivists([query, ...(payloads ?? [])]))
    }
    const result = await this.params.querySender.sendBridgeQuery(this.params.moduleAddress, query, payloads)
    if (this.archiving && this.isAllowedArchivingQuery(query.schema)) {
      forget(this.storeToArchivists(result.flat()))
    }
    return result
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
      mod: this,
      transformers: this.moduleIdentifierTransformers,
      upResolver: this.upResolver,
    }
    if (idOrFilter === '*') {
      return [...(await this.publicChildren()), await this.params.host.resolve(this.address)] as T[]
    }
    switch (typeof idOrFilter) {
      case 'string': {
        const parts = idOrFilter.split(':')
        const first = assertEx(parts.shift(), () => 'Missing first')
        const remainingPath = parts.join(':')
        const address =
          isAddress(first) ? first
          : this.id === first ? this.address
          : this.childAddressByName(first)
        if (!address) return undefined
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
}

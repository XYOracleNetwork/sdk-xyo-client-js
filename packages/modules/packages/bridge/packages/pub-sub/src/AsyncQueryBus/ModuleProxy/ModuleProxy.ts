import { AbstractModuleProxy, ModuleProxyParams } from '@xyo-network/abstract-bridge'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleInstance, ModuleQueryResult } from '@xyo-network/module-model'
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

  async proxyQueryHandler<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    this.params.onQuerySendStarted?.({ payloads, query })
    const result = await this.params.busClient.send(this.address, query, payloads)
    if (this.archiving && this.isAllowedArchivingQuery(query.schema)) {
      await this.storeToArchivists(result.flat())
    }
    this.params.onQuerySendFinished?.({ payloads, query, result, status: 'success' })
    return result
  }

  override async startHandler(): Promise<boolean> {
    return await super.startHandler()
  }
}

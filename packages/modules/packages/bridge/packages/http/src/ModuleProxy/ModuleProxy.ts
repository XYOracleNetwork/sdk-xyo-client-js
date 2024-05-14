import { Address } from '@xylabs/hex'
import { AbstractModuleProxy, ModuleProxyParams } from '@xyo-network/abstract-bridge'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleInstance, ModuleQueryResult } from '@xyo-network/module-model'
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
  implements ModuleInstance<TParams, TWrappedModule['eventData']>
{
  static createCount = 0

  constructor(params: TParams) {
    HttpModuleProxy.createCount = HttpModuleProxy.createCount + 1
    if (Math.floor(HttpModuleProxy.createCount / 10) === HttpModuleProxy.createCount / 10) {
      console.log(`HttpModuleProxy.createCount: ${HttpModuleProxy.createCount}`)
    }
    super(params)
  }

  async proxyQueryHandler<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads: Payload[] = []): Promise<ModuleQueryResult> {
    this.params.onQuerySendStarted?.({ payloads, query })
    const result = await this.params.querySender.sendBridgeQuery(this.params.moduleAddress, query, payloads)
    if (this.archiving && this.isAllowedArchivingQuery(query.schema)) {
      await this.storeToArchivists(result.flat())
    }
    this.params.onQuerySendFinished?.({ payloads, query, result, status: 'success' })
    return result
  }
}

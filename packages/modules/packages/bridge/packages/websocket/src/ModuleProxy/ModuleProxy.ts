import type { Address } from '@xylabs/hex'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import type { ModuleProxyParams } from '@xyo-network/bridge-abstract'
import { AbstractModuleProxy } from '@xyo-network/bridge-abstract'
import {
  creatableModule, type ModuleInstance, type ModuleQueryResult,
} from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export interface WebsocketBridgeQuerySender {
  sendBridgeQuery: <TOut extends Payload = Payload, TQuery extends QueryBoundWitness = QueryBoundWitness, TIn extends Payload = Payload>(
    targetAddress: Address,
    query: TQuery,
    payloads?: TIn[],
  ) => Promise<ModuleQueryResult<TOut>>
}

export type WebsocketModuleProxyParams = ModuleProxyParams & {
  querySender: WebsocketBridgeQuerySender
}

@creatableModule()
export class WebsocketModuleProxy<
  TWrappedModule extends ModuleInstance = ModuleInstance,
  TParams extends Omit<WebsocketModuleProxyParams, 'config'> & { config: TWrappedModule['config'] } = Omit<WebsocketModuleProxyParams, 'config'> & {
    config: TWrappedModule['config']
  },
>
  extends AbstractModuleProxy<TWrappedModule, TParams>
  implements ModuleInstance<TParams, TWrappedModule['eventData']> {
  async proxyQueryHandler<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads: Payload[] = []): Promise<ModuleQueryResult> {
    return await this.params.querySender.sendBridgeQuery(this.params.moduleAddress, query, payloads)
  }
}

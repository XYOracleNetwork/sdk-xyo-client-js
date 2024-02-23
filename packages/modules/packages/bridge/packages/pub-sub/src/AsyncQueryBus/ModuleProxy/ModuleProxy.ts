import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { Module, ModuleInstance, ModuleQueryResult } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { AbstractModuleProxy, ModuleProxyParams } from '../../AbstractModuleProxy'
import { AsyncQueryBusClient } from '../AsyncQueryBusClient'

export type AsyncQueryBusModuleProxyParams = ModuleProxyParams & {
  busClient: AsyncQueryBusClient
}

export class AsyncQueryBusModuleProxy<TWrappedModule extends Module = Module>
  extends AbstractModuleProxy<AsyncQueryBusModuleProxyParams, TWrappedModule>
  implements ModuleInstance<TWrappedModule['params'], TWrappedModule['eventData']>
{
  async query<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    return await this.proxyParams.busClient.send(this.address, query, payloads)
  }
}

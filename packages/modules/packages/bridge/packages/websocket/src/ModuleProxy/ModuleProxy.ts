import { AbstractModuleProxy, ModuleProxyParams } from '@xyo-network/abstract-bridge'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleInstance, ModuleQueryResult } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { io as Client } from 'socket.io-client'

export type WebsocketModuleProxyParams = ModuleProxyParams & {
  client?: typeof Client
  maxPayloadSizeWarning?: number
  moduleUrl: string
}

export class WebsocketModuleProxy<
    TWrappedModule extends ModuleInstance = ModuleInstance,
    TParams extends Omit<WebsocketModuleProxyParams, 'config'> & { config: TWrappedModule['config'] } = Omit<WebsocketModuleProxyParams, 'config'> & {
      config: TWrappedModule['config']
    },
  >
  extends AbstractModuleProxy<TWrappedModule, TParams>
  implements ModuleInstance<TParams, TWrappedModule['eventData']>
{
  async proxyQueryHandler<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads: Payload[] = []): Promise<ModuleQueryResult> {
    const { maxPayloadSizeWarning } = this.params
    const payloadSize = JSON.stringify([query, payloads]).length
    if (maxPayloadSizeWarning && payloadSize > maxPayloadSizeWarning) {
      this.logger?.warn(
        `Large targetQuery being sent: ${payloadSize} bytes [${this.address}][${this.moduleAddress}] [${query.schema}] [${payloads?.length}]`,
      )
    }
    await Promise.resolve()
    throw new Error('Unsupported')
  }
}

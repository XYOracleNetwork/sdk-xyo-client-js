import { Axios, AxiosError } from '@xylabs/axios'
import { toJsonString } from '@xylabs/object'
import { AbstractModuleProxy, ModuleProxyParams } from '@xyo-network/abstract-bridge'
import { ApiEnvelope } from '@xyo-network/api-models'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleInstance, ModuleQueryResult } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type HttpModuleProxyParams = ModuleProxyParams & {
  axios: Axios
  maxPayloadSizeWarning?: number
  moduleUrl: string
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
  pipeline?: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many' | undefined
  async proxyQueryHandler<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads: Payload[] = []): Promise<ModuleQueryResult> {
    try {
      const { axios, moduleUrl, maxPayloadSizeWarning } = this.params
      const payloadSize = JSON.stringify([query, payloads]).length
      if (maxPayloadSizeWarning && payloadSize > maxPayloadSizeWarning) {
        this.logger?.warn(
          `Large targetQuery being sent: ${payloadSize} bytes [${this.address}][${this.moduleAddress}] [${query.schema}] [${payloads?.length}]`,
        )
      }
      const result = await axios.post<ApiEnvelope<ModuleQueryResult>>(moduleUrl, [query, payloads])
      if (result.status === 404) {
        throw `target module not found [${moduleUrl}] [${result.status}]`
      }
      if (result.status >= 400) {
        this.logger?.error(`targetQuery failed [${moduleUrl}]`)
        throw `targetQuery failed [${moduleUrl}] [${result.status}]`
      }
      return result.data?.data
    } catch (ex) {
      const error = ex as AxiosError
      this.logger?.error(`Error: ${toJsonString(error)}`)
      throw error
    }
  }
}

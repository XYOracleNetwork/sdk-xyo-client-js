import { Axios, AxiosError } from '@xylabs/axios'
import { AbstractModuleProxy, ModuleProxyParams } from '@xyo-network/abstract-bridge'
import { ApiEnvelope } from '@xyo-network/api-models'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { Module, ModuleInstance, ModuleQueryResult } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type HttpModuleProxyParams = ModuleProxyParams & {
  axios: Axios
  maxPayloadSizeWarning?: number
  moduleUrl: string
}

export class HttpModuleProxy<TWrappedModule extends Module = Module>
  extends AbstractModuleProxy<HttpModuleProxyParams, TWrappedModule>
  implements ModuleInstance<TWrappedModule['params'], TWrappedModule['eventData']>
{
  async queryHandler<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads: Payload[] = []): Promise<ModuleQueryResult> {
    try {
      const { axios, moduleUrl, maxPayloadSizeWarning } = this.proxyParams
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
      this.logger?.error(`Error Status: ${error.status}`)
      this.logger?.error(`Error Cause: ${JSON.stringify(error.cause, null, 2)}`)
      throw error
    }
  }

  setConfig(config: TWrappedModule['params']['config']) {
    this.params.config = config
  }
}

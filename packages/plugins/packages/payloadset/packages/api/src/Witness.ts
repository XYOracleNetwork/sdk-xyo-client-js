import { assertEx } from '@xylabs/assert'
import { Axios, AxiosError, AxiosJson } from '@xylabs/axios'
import { Buffer } from '@xylabs/buffer'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Hash, PayloadHasher } from '@xyo-network/hash'
import { JsonArray, JsonObject } from '@xyo-network/object'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { WitnessParams } from '@xyo-network/witness-model'
import { fromByteArray } from 'base64-js'
import template from 'es6-template-strings'

import { ApiCallWitnessConfig, ApiCallWitnessConfigSchema, asApiUriCallWitnessConfig, asApiUriTemplateCallWitnessConfig } from './Config'
import { checkIpfsUrl } from './lib'
import {
  ApiCall,
  ApiCallBase64Result,
  ApiCallErrorResult,
  ApiCallJsonResult,
  ApiCallResult,
  ApiCallResultSchema,
  ApiCallSchema,
  asApiUriCall,
  asApiUriTemplateCall,
} from './Payload'

export type ApiCallWitnessParams = WitnessParams<
  ApiCallWitnessConfig,
  {
    headers?: Record<string, string | undefined>
    ipfsGateway?: string
  }
>

export class ApiCallWitness<TParams extends ApiCallWitnessParams = ApiCallWitnessParams> extends AbstractWitness<TParams, ApiCall, ApiCallResult> {
  static override configSchemas = [ApiCallWitnessConfigSchema]

  get accept() {
    return this.config.accept ?? 'application/json'
  }

  get ipfsGateway() {
    return this.params.ipfsGateway
  }

  getUri(call?: ApiCall): string {
    const { uri: callUri } = asApiUriCall(call) ?? {}
    const { uriTemplate: callUriTemplate, params: callParams } = asApiUriTemplateCall(call) ?? {}
    const { uri: configUri } = asApiUriCallWitnessConfig(this.config) ?? {}
    const { uriTemplate: configUriTemplate, params: configParams } = asApiUriTemplateCallWitnessConfig(this.config) ?? {}

    const params = { ...configParams, ...callParams }

    if (callUri) {
      return callUri
    }

    if (callUriTemplate) {
      return template(callUriTemplate, params)
    }

    if (configUri) {
      return configUri
    }

    if (configUriTemplate) {
      return template(configUriTemplate, params)
    }

    throw Error('Unable to determine uri. No uri/uriTemplate specified in either the call or config.')
  }

  protected override async observeHandler(inPayloads: ApiCall[] = []): Promise<ApiCallResult[]> {
    await this.started('throw')
    try {
      const observations = await Promise.all(
        inPayloads.filter(isPayloadOfSchemaType(ApiCallSchema)).map(async (call) => {
          const { verb: callVerb } = call
          const { verb: configVerb } = this.config
          const verb = callVerb ?? configVerb ?? 'get'
          const uri = this.getUri(call)

          const validatedUri = assertEx(checkIpfsUrl(uri, this.ipfsGateway), 'Invalid URI')

          if (verb === 'get') {
            return this.httpGet(validatedUri, uri)
          }

          const observation: ApiCallResult = {
            call: await PayloadHasher.hashAsync(call),
            schema: ApiCallResultSchema,
          }
          return observation
        }),
      )
      return observations
    } catch (ex) {
      const error = ex as Error
      console.error(`Error [${this.config.name}]: ${error.message}`)
      console.log(error.stack)
      throw error
    }
  }

  private async httpGet(url: string, call: Hash): Promise<ApiCallResult> {
    const result: ApiCallResult = {
      call,
      schema: ApiCallResultSchema,
    }
    try {
      switch (this.accept) {
        case 'application/json': {
          const axios = new AxiosJson({ headers: this.params.headers })
          const response = await axios.get<JsonArray | JsonObject>(url)
          if (response.status >= 200 && response.status < 300) {
            const jsonResult = result as ApiCallJsonResult
            jsonResult.data = response.data
            jsonResult.contentType = 'application/json'
          } else {
            const errorResult = result as ApiCallErrorResult
            errorResult.http = {
              status: response.status,
            }
          }
          break
        }
        default: {
          const axios = new Axios({ headers: this.params.headers, responseType: 'arraybuffer' })
          const response = await axios.get(url)
          if (response.status >= 200 && response.status < 300) {
            const jsonResult = result as ApiCallBase64Result
            jsonResult.data = fromByteArray(Buffer.from(response.data, 'binary'))
            jsonResult.contentType = response.headers['content-type']?.toString() ?? 'application/octet-stream'
          } else {
            const errorResult = result as ApiCallErrorResult
            errorResult.http = {
              status: response.status,
            }
          }
          break
        }
      }
    } catch (ex) {
      const axiosError = ex as AxiosError
      if (axiosError.isAxiosError) {
        if (axiosError?.response?.status !== undefined) {
          result.http = result.http ?? {}
          result.http.status = axiosError?.response?.status
        }
        if (axiosError?.code !== undefined) {
          result.http = result.http ?? {}
          result.http.code = axiosError?.code
        }
        return result
      } else {
        throw ex
      }
    }
    return result
  }
}

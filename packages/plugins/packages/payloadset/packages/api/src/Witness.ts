import { assertEx } from '@xylabs/assert'
import { Axios, AxiosError, AxiosJson } from '@xylabs/axios'
import { Buffer } from '@xylabs/buffer'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Hash, PayloadHasher } from '@xyo-network/hash'
import { JsonArray, JsonObject } from '@xyo-network/object'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { WitnessConfig, WitnessParams } from '@xyo-network/witness-model'
import { fromByteArray } from 'base64-js'

import { checkIpfsUrl } from './lib'
import {
  ApiCall,
  ApiCallBase64Result,
  ApiCallErrorResult,
  ApiCallJsonResult,
  ApiCallResult,
  ApiCallResultSchema,
  ApiCallSchema,
  Verb,
} from './Payload'

export const ApiCallWitnessConfigSchema = 'network.xyo.api.call.witness.config'
export type ApiCallWitnessConfigSchema = typeof ApiCallWitnessConfigSchema

export type ApiCallWitnessConfig = WitnessConfig<
  {
    accept: 'application/json'
    verb?: Verb
  },
  ApiCallWitnessConfigSchema
>

export type ApiCallWitnessParams = WitnessParams<ApiCallWitnessConfig, { ipfsGateway?: string }>

export class ApiCallWitness<TParams extends ApiCallWitnessParams = ApiCallWitnessParams> extends AbstractWitness<TParams, ApiCall, ApiCallResult> {
  static override configSchemas = [ApiCallWitnessConfigSchema]

  get accept() {
    return this.config.accept
  }

  get ipfsGateway() {
    return this.params.ipfsGateway
  }

  protected override async observeHandler(inPayloads: ApiCall[] = []): Promise<ApiCallResult[]> {
    await this.started('throw')
    try {
      const observations = await Promise.all(
        inPayloads.filter(isPayloadOfSchemaType(ApiCallSchema)).map(async (call) => {
          const { uri, verb } = call

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
      console.log(`Error [${this.config.name}]: ${error.message}`)
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
          const axios = new AxiosJson()
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
          const axios = new Axios({ responseType: 'arraybuffer' })
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

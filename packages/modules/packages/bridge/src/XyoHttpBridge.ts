import { assertEx } from '@xylabs/assert'
import { XyoBoundWitness, XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoModule } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'
import { Axios, AxiosError, AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import { gzip } from 'pako'

import { BridgeModule } from './Bridge'
import { XyoBridgeConfig } from './Config'
import { PartialBridgeConfig } from './PartialBridgeConfig'
import { XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from './Queries'

export type XyoHttpBridgeConfigSchema = 'network.xyo.bridge.http.config'
export const XyoHttpBridgeConfigSchema: XyoHttpBridgeConfigSchema = 'network.xyo.bridge.http.config'

export type XyoHttpBridgeConfig = XyoBridgeConfig<{
  schema: XyoHttpBridgeConfigSchema
  headers?: AxiosRequestHeaders
  axios?: AxiosRequestConfig
}>

export class XyoHttpBridge<TQuery extends XyoBridgeQuery = XyoBridgeQuery>
  extends XyoModule<XyoHttpBridgeConfig, TQuery>
  implements BridgeModule<TQuery>
{
  private axios

  constructor(config: PartialBridgeConfig<XyoHttpBridgeConfig>) {
    super({ schema: XyoHttpBridgeConfigSchema, ...config })
    this.axios = new Axios(this.axiosConfig)
  }

  public get uri() {
    return assertEx(this.config?.uri, 'Missing URI')
  }

  private get axiosHeaders(): AxiosRequestHeaders {
    return {
      ...this.config?.headers,
      Accept: 'application/json, text/plain, *.*',
      'Content-Type': 'application/json',
    }
  }

  private get axiosConfig(): AxiosRequestConfig {
    return {
      headers: this.axiosHeaders,
      transformRequest: (data, headers) => {
        const json = JSON.stringify(data)
        if (headers && data) {
          if (json.length > (this.config?.axios ?? 1024)) {
            headers['Content-Encoding'] = 'gzip'
            return gzip(JSON.stringify(data)).buffer
          }
        }
        return JSON.stringify(data)
      },
      transformResponse: (data) => {
        try {
          return JSON.parse(data)
        } catch (ex) {
          return null
        }
      },
    }
  }

  connect(): Promisable<boolean> {
    return true
  }

  disconnect(): Promisable<boolean> {
    return true
  }

  async forward(query: TQuery): Promise<[XyoBoundWitness, XyoPayloads]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payloads = (query as any as { payloads?: XyoPayload[] })?.payloads || []
      const bw = new XyoBoundWitnessBuilder({ inlinePayloads: true }).payloads(payloads).build()
      const path = `${this.uri}/${this.config?.archive}`
      const result = await this.axios.post<string[][]>(path, bw)
      const queryId = result?.data?.[0]?.[0]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (result.status !== 202 || !queryId) return [] as any as [XyoBoundWitness, XyoPayloads]
      const queryResultUri = `${this.uri}/query/${queryId}`
      const queryResult = await this.axios.get<XyoPayload>(queryResultUri)
      const forwardedPayload = queryResult.data
      const bound = this.bindPayloads([forwardedPayload])
      return [bound, [forwardedPayload]]
    } catch (ex) {
      const error = ex as AxiosError
      console.log(`Error Status: ${error.status}`)
      console.log(`Error Cause: ${JSON.stringify(error.cause, null, 2)}`)
      throw error
    }
  }

  override async query(query: TQuery): Promise<[XyoBoundWitness, XyoPayloads]> {
    console.log(`Query: ${query.schema}`)
    const payloads: (XyoPayload | null)[] = []
    switch (query.schema) {
      case XyoBridgeConnectQuerySchema: {
        await this.connect()
        break
      }
      case XyoBridgeDisconnectQuerySchema: {
        await this.disconnect()
        break
      }
      default:
        if (super.queries().find((schema) => schema === query.schema)) {
          return super.query(query)
        } else {
          return this.forward(query)
        }
    }
    return [this.bindPayloads(payloads), payloads]
  }
}

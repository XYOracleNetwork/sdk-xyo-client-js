import { assertEx } from '@xylabs/assert'
import { AxiosJson } from '@xylabs/axios'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'
import { WitnessConfig, WitnessParams } from '@xyo-network/witness-model'
import type { ExecutionResult } from 'graphql'

export const ApiGraphqlWitnessConfigSchema = 'network.xyo.api.witness.config'
export type ApiGraphqlWitnessConfigSchema = typeof ApiGraphqlWitnessConfigSchema

export type ApiGraphqlWitnessConfig = WitnessConfig<{
  endpoint?: string
  schema: ApiGraphqlWitnessConfigSchema
  timeout?: number
}>

export type HttpHeaderValue = string | string[] | number | boolean | null

export interface HttpHeaders {
  [key: string]: HttpHeaderValue
}

export type ApiGraphqlWitnessParams = WitnessParams<
  AnyConfigSchema<ApiGraphqlWitnessConfig>,
  {
    endpoint?: string
    headers?: HttpHeaders
  }
>

export const GraphqlQuerySchema = 'network.xyo.graphql.query'
export type GraphqlQuerySchema = typeof GraphqlQuerySchema

export type GraphqlQuery = Payload<
  {
    query: string
    variables: Record<string, unknown>
  },
  GraphqlQuerySchema
>

export const GraphqlResultSchema = 'network.xyo.graphql.result'
export type GraphqlResultSchema = typeof GraphqlResultSchema

export type GraphqlResult<TData = Record<string, unknown>, TExtensions = Record<string, unknown>> = Payload<
  {
    http?: {
      code?: string
      ipAddress?: string
      status?: number
    }
    result?: ExecutionResult<TData, TExtensions>
  },
  GraphqlResultSchema
>

export const isGraphqlQuery = isPayloadOfSchemaType<GraphqlQuery>(GraphqlQuerySchema)

export class ApiGraphqlWitness<TParams extends ApiGraphqlWitnessParams = ApiGraphqlWitnessParams> extends AbstractWitness<
  TParams,
  GraphqlQuery,
  GraphqlResult
> {
  static override configSchemas = [ApiGraphqlWitnessConfigSchema]

  get endpoint() {
    return assertEx(this.config.endpoint ?? this.params.endpoint, 'No endpoint specified')
  }

  get headers() {
    return this.params.headers
  }

  get timeout() {
    return this.config.timeout
  }

  protected override async observeHandler(payloads?: GraphqlQuery[]): Promise<GraphqlResult[]> {
    await this.started('throw')
    const queries = payloads?.filter(isGraphqlQuery) ?? []
    const axios = new AxiosJson({ headers: this.headers, timeout: this.timeout })
    const observations = await Promise.all(
      queries.map(async ({ query, variables }) => {
        const httpResult = await axios.post(this.endpoint, { query, variables })
        const result: GraphqlResult = {
          http: {
            status: httpResult.status,
          },
          result: httpResult.data,
          schema: GraphqlResultSchema,
        }
        return result
      }),
    )
    return observations.flat()
  }
}

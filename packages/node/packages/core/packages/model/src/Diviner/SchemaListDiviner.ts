import { AbstractDiviner, PayloadStatsDivinerConfig } from '@xyo-network/diviner'
import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type SchemaListDivinerSchema = 'network.xyo.diviner.schema.list'
export const SchemaListDivinerSchema: SchemaListDivinerSchema = 'network.xyo.diviner.schema.list'

export type SchemaListDivinerQuerySchema = `${SchemaListDivinerSchema}.query`
export const SchemaListDivinerQuerySchema: SchemaListDivinerQuerySchema = `${SchemaListDivinerSchema}.query`

export type SchemaListConfigSchema = `${SchemaListDivinerSchema}.config`
export const SchemaListConfigSchema: SchemaListConfigSchema = `${SchemaListDivinerSchema}.config`

export type SchemaListDivinerConfig<S extends string = SchemaListConfigSchema, T extends Payload = Payload> = PayloadStatsDivinerConfig<
  S,
  T & {
    schema: S
  }
>

export type SchemaListPayload = Payload<{
  schema: SchemaListDivinerSchema
  schemas: string[]
}>

export const isSchemaListPayload = (x?: Payload | null): x is SchemaListPayload => x?.schema === SchemaListDivinerSchema

export type SchemaListQueryPayload = Query<{ schema: SchemaListDivinerQuerySchema }>
export const isSchemaListQueryPayload = (x?: Payload | null): x is SchemaListQueryPayload => x?.schema === SchemaListDivinerQuerySchema

export type SchemaListDiviner = AbstractDiviner

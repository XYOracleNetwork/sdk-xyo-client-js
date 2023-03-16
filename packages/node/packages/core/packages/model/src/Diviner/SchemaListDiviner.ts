import { AbstractDiviner } from '@xyo-network/diviner'
import { XyoQuery } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'

import { ArchivistPayloadStatsDivinerConfig } from './PayloadStatsDiviner'

export type SchemaListSchema = 'network.xyo.archivist.schema.list'
export const SchemaListSchema: SchemaListSchema = 'network.xyo.archivist.schema.list'

export type SchemaListQuerySchema = 'network.xyo.archivist.schema.list.query'
export const SchemaListQuerySchema: SchemaListQuerySchema = 'network.xyo.archivist.schema.list.query'

export type SchemaListConfigSchema = 'network.xyo.archivist.schema.list.config'
export const SchemaListConfigSchema: SchemaListConfigSchema = 'network.xyo.archivist.schema.list.config'

export type SchemaListDivinerConfig<
  S extends string = SchemaListConfigSchema,
  T extends XyoPayload = XyoPayload,
> = ArchivistPayloadStatsDivinerConfig<
  S,
  T & {
    schema: S
  }
>

export type SchemaListPayload = XyoPayload<{
  schema: SchemaListSchema
  schemas: string[]
}>

export const isSchemaListPayload = (x?: XyoPayload | null): x is SchemaListPayload => x?.schema === SchemaListSchema

export type SchemaListQueryPayload = XyoQuery<{ schema: SchemaListQuerySchema }>
export const isSchemaListQueryPayload = (x?: XyoPayload | null): x is SchemaListQueryPayload => x?.schema === SchemaListQuerySchema

export type SchemaListDiviner = AbstractDiviner

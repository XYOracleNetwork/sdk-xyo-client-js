import { XyoPayload } from '@xyo-network/payload-model'
import { XyoSchemaSchema } from '@xyo-network/schema-payload-plugin'

export type SchemaList = XyoPayload<
  {
    name: string
  },
  XyoSchemaSchema
>

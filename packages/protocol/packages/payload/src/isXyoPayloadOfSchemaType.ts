import { XyoPayload } from '@xyo-network/payload-model'

export const isXyoPayloadOfSchemaType = <T extends XyoPayload>(schema: string) => {
  return (x: XyoPayload): x is T => x.schema === schema
}

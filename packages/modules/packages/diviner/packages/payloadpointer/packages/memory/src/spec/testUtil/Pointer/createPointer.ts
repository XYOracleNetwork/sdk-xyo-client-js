import type { Order } from '@xyo-network/diviner-payload-model'
import type {
  PayloadAddressRule,
  PayloadPointerPayload,
  PayloadRule,
  PayloadSchemaRule,
  PayloadTimestampOrderRule,
} from '@xyo-network/diviner-payload-pointer-model'
import { PayloadPointerSchema } from '@xyo-network/diviner-payload-pointer-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'

export const createPointer = async (
  addresses: string[][] = [],
  schemas: string[][] = [],
  timestamp = Date.now(),
  order: Order = 'desc',
): Promise<PayloadPointerPayload> => {
  const reference: PayloadRule[][] = []

  const schemaRules: PayloadSchemaRule[][] = schemas.map((rules) => {
    return rules.map((schema) => {
      return { schema }
    })
  })
  if (schemaRules.length > 0) reference.push(...schemaRules)

  const addressRules: PayloadAddressRule[][] = addresses.map((rules) => {
    return rules.map((address) => {
      return { address }
    })
  })
  if (addressRules.length > 0) reference.push(...addressRules)

  const timestampRule: PayloadTimestampOrderRule = { order, timestamp }
  reference.push([timestampRule])

  return await new PayloadBuilder<PayloadPointerPayload>({ schema: PayloadPointerSchema }).fields({ reference }).build()
}

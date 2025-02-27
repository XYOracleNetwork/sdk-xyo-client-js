import { Order } from '@xyo-network/diviner-payload-model'
import {
  PayloadAddressRule,
  PayloadPointerPayload,
  PayloadPointerSchema,
  PayloadRule,
  PayloadSchemaRule,
  PayloadSequenceOrderRule,
} from '@xyo-network/diviner-payload-pointer-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Sequence, SequenceConstants } from '@xyo-network/payload-model'

export const createPointer = (
  addresses: string[][] = [],
  schemas: string[][] = [],
  order: Order = 'desc',
  sequence?: Sequence,
): PayloadPointerPayload => {
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

  const sequenceOrderRule: PayloadSequenceOrderRule = { order }
  if (sequence != SequenceConstants.minLocalSequence) sequenceOrderRule.sequence = sequence
  reference.push([sequenceOrderRule])

  return new PayloadBuilder<PayloadPointerPayload>({ schema: PayloadPointerSchema }).fields({ reference }).build()
}

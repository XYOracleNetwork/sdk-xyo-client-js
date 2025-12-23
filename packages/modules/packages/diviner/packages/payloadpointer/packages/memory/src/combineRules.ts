import type { Address } from '@xylabs/sdk-js'
import { assertEx, exists } from '@xylabs/sdk-js'
import type { Order } from '@xyo-network/diviner-payload-model'
import type {
  PayloadRule,
  PayloadSearchCriteria,
} from '@xyo-network/diviner-payload-pointer-model'
import {
  isPayloadAddressRule,
  isPayloadSchemaRule,
  isPayloadSequenceOrderRule,
} from '@xyo-network/diviner-payload-pointer-model'

// TODO: Could make it so that composability is such that we:
// • AND first dimension of array
// • OR 2nd dimension of array
export const combineRules = (rules: PayloadRule[][]): PayloadSearchCriteria => {
  const addresses = rules
    .flat()
    .filter(isPayloadAddressRule)
    .map(r => r.address)
    .filter(exists) as Address[]

  const schemas = rules
    .flat()
    .filter(isPayloadSchemaRule)
    .map(r => r.schema)
    .filter(exists)
  assertEx(schemas.length, () => 'At least one schema must be supplied')

  const sequenceOrderRule = rules.flat().filter(isPayloadSequenceOrderRule).filter(exists)
  assertEx(sequenceOrderRule.length < 2, () => 'Must not supply more than 1 direction/timestamp rule')

  const order: Order = sequenceOrderRule[0]?.order || 'desc'
  const cursor = sequenceOrderRule[0]?.sequence

  return {
    addresses,
    cursor,
    order,
    schemas,
  }
}

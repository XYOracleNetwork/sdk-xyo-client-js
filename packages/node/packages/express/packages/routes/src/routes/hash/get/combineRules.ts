import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { SortDirection } from '@xyo-network/diviner-payload-model'
import {
  isPayloadAddressRule,
  isPayloadSchemaRule,
  isPayloadTimestampDirectionRule,
  PayloadRule,
  PayloadSearchCriteria,
} from '@xyo-network/node-core-model'

// TODO: Could make it so that composability is such that we:
// • AND first dimension of array
// • OR 2nd dimension of array
export const combineRules = (rules: PayloadRule[][]): PayloadSearchCriteria => {
  const addresses = rules
    .flat()
    .filter(isPayloadAddressRule)
    .map((r) => r.address)
    .filter(exists)

  const schemas = rules
    .flat()
    .filter(isPayloadSchemaRule)
    .map((r) => r.schema)
    .filter(exists)
  assertEx(schemas.length, 'At least one schema must be supplied')

  const directionTimestamp = rules.flat().filter(isPayloadTimestampDirectionRule).filter(exists)
  assertEx(directionTimestamp.length < 2, 'Must not supply more than 1 direction/timestamp rule')

  const direction: SortDirection = directionTimestamp[0]?.direction || 'desc'
  const timestamp: number = directionTimestamp.length ? directionTimestamp[0]?.timestamp : Date.now()

  return {
    addresses,
    direction,
    schemas,
    timestamp,
  }
}

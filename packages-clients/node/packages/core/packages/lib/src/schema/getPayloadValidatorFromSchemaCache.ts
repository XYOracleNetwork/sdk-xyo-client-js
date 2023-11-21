import type { GetValidator } from '@xyo-network/node-core-model'
import type { Payload } from '@xyo-network/payload-model'
import type { PayloadWithPartialMeta } from '@xyo-network/payload-mongodb'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { SchemaCache } from '@xyo-network/schema-cache'
import { SchemaPayload } from '@xyo-network/schema-payload-plugin'
// eslint-disable-next-line import/no-named-as-default
import Ajv from 'ajv'

const ajv = new Ajv()

export const getPayloadValidatorFromSchemaCache: GetValidator<Payload> = async (payload) => {
  // Get the schema from the schema cache
  const schemaPayload: PayloadWithPartialMeta<SchemaPayload> | undefined = (await SchemaCache.instance.get(payload.schema))?.payload
  // If it doesn't exist return undefined
  if (!schemaPayload) return undefined
  const { definition, _hash } = schemaPayload
  // Use the schema cache payload hash as the AJV cache key to memoize
  // the AJV validator
  const key = _hash || (await PayloadWrapper.hashAsync(schemaPayload))
  // Check if we already cached the validator
  const validate = ajv.getSchema(key)
  // Return the cached validator for this schema
  if (validate) return validate
  // Otherwise, compile it now
  ajv.addSchema(definition, key)
  // and return it
  return ajv.getSchema(key)
}

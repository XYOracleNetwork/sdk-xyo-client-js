import type { GetValidator } from '@xyo-network/node-core-model'
import type { Payload } from '@xyo-network/payload-model'

import { getPayloadValidatorFromSchemaCache } from './getPayloadValidatorFromSchemaCache'

export const validatePayloadSchema = async (
  payload: Payload,
  getValidator: GetValidator<Payload> = getPayloadValidatorFromSchemaCache,
): Promise<boolean> => {
  const validate = await getValidator(payload)
  if (!validate) return true
  const valid = await validate(payload)
  return !valid ? false : true
}

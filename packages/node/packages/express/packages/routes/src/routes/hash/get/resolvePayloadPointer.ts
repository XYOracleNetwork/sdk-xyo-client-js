import { resolveBySymbol } from '@xyo-network/express-node-lib'
import { BoundWitnessDiviner, PayloadDiviner, PayloadPointerPayload } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Payload } from '@xyo-network/payload-model'
import { Request } from 'express'

import { combineRules } from './combineRules'
import { findPayload } from './findPayload'

export const resolvePayloadPointer = async (req: Request, pointer: PayloadPointerPayload): Promise<Payload | undefined> => {
  const { node } = req.app
  const searchCriteria = combineRules(pointer.reference)
  const boundWitnessDiviner = await resolveBySymbol<BoundWitnessDiviner>(node, TYPES.BoundWitnessDiviner)
  const payloadDiviner = await resolveBySymbol<PayloadDiviner>(node, TYPES.PayloadDiviner)
  return findPayload(boundWitnessDiviner, payloadDiviner, searchCriteria)
}

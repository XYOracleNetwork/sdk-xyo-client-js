import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-model'
import { resolveBySymbol } from '@xyo-network/express-node-lib'
import { PayloadArchivist, PayloadPointerPayload } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { PayloadDiviner } from '@xyo-network/payload-diviner-model'
import { Payload } from '@xyo-network/payload-model'
import { Request } from 'express'

import { combineRules } from './combineRules'
import { findPayload } from './findPayload'

export const resolvePayloadPointer = async (req: Request, pointer: PayloadPointerPayload): Promise<Payload | undefined> => {
  const { node } = req.app
  const searchCriteria = combineRules(pointer.reference)
  const archivist = await resolveBySymbol<PayloadArchivist>(node, TYPES.Archivist)
  const boundWitnessDiviner = await resolveBySymbol<BoundWitnessDiviner>(node, TYPES.BoundWitnessDiviner)
  const payloadDiviner = await resolveBySymbol<PayloadDiviner>(node, TYPES.PayloadDiviner)
  return findPayload(archivist, boundWitnessDiviner, payloadDiviner, searchCriteria)
}

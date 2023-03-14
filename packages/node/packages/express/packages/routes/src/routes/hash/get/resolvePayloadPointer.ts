import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { resolveBySymbol } from '@xyo-network/express-node-lib'
import { BoundWitnessesArchivist, PayloadPointerPayload } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { XyoPayload } from '@xyo-network/payload-model'
import { Request } from 'express'

import { combineRules } from './combineRules'
import { findPayload } from './findPayload'

export const resolvePayloadPointer = async (req: Request, pointer: PayloadPointerPayload): Promise<XyoPayload | undefined> => {
  const { node } = req.app
  const searchCriteria = combineRules(pointer.reference)
  const payloadArchivist = ArchivistWrapper.wrap(await resolveBySymbol(node, TYPES.PayloadArchivist))
  const boundWitnessArchivist = await resolveBySymbol<BoundWitnessesArchivist>(node, TYPES.BoundWitnessArchivist)
  return findPayload(boundWitnessArchivist, payloadArchivist, searchCriteria)
}

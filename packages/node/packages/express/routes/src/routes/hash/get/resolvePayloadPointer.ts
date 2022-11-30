import { assertEx } from '@xylabs/assert'
import { requestAccessibleArchives } from '@xyo-network/express-node-lib'
import { BoundWitnessesArchivist, PayloadArchivist, PayloadPointerPayload } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { XyoPayload } from '@xyo-network/payload'
import { Request } from 'express'

import { combineRules } from './combineRules'
import { findPayload } from './findPayload'

export const resolvePayloadPointer = async (req: Request, pointer: PayloadPointerPayload): Promise<XyoPayload | undefined> => {
  const { node } = req.app
  const searchCriteria = combineRules(pointer.reference)
  const accessibleArchives = await requestAccessibleArchives(req, searchCriteria.archives)
  if (!accessibleArchives.length) return undefined
  searchCriteria.archives = accessibleArchives
  const payloadArchivists = await node.tryResolve({ name: [assertEx(TYPES.PayloadArchivist.description)] })
  const payloadArchivist = assertEx(payloadArchivists[0]) as PayloadArchivist
  const boundWitnessArchivists = await node.tryResolve({ name: [assertEx(TYPES.BoundWitnessArchivist.description)] })
  const boundWitnessArchivist = assertEx(boundWitnessArchivists[0]) as BoundWitnessesArchivist
  return findPayload(boundWitnessArchivist, payloadArchivist, searchCriteria)
}

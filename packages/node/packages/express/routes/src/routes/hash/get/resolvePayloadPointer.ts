import { requestAccessibleArchives } from '@xyo-network/express-node-lib'
import { PayloadPointerPayload } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload'
import { Request } from 'express'

import { combineRules } from './combineRules'
import { findPayload } from './findPayload'

export const resolvePayloadPointer = async (req: Request, pointer: PayloadPointerPayload): Promise<XyoPayload | undefined> => {
  const { boundWitnessArchivist, payloadArchivist } = req.app
  const searchCriteria = combineRules(pointer.reference)
  const accessibleArchives = await requestAccessibleArchives(req, searchCriteria.archives)
  if (!accessibleArchives.length) return undefined
  searchCriteria.archives = accessibleArchives
  return findPayload(boundWitnessArchivist, payloadArchivist, searchCriteria)
}

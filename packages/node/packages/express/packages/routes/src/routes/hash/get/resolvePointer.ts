import { asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import { resolveBySymbol } from '@xyo-network/express-node-lib'
import { PointerPayload } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Payload } from '@xyo-network/payload-model'
import { Request } from 'express'

import { findPayload } from './findPayload'

export const resolvePointer = async (req: Request, pointer: PointerPayload): Promise<Payload | undefined> => {
  const { node } = req.app
  const module = await resolveBySymbol(node, TYPES.Archivist)
  const archivist = asArchivistInstance(module, `Failed to cast archivist wrapper ${module?.address}`)
  const boundWitnessDiviner = asDivinerInstance(
    await resolveBySymbol(node, TYPES.BoundWitnessDiviner),
    'Resolved a non-Diviner',
  ) as BoundWitnessDiviner
  const payloadDiviner = asDivinerInstance(await resolveBySymbol(node, TYPES.PayloadDiviner), 'Resolved a non-Diviner') as PayloadDiviner
  return findPayload(archivist, boundWitnessDiviner, payloadDiviner, pointer)
}

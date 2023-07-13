import { asArchivistInstance, asArchivistModule, IndirectArchivistModule } from '@xyo-network/archivist-model'
import { IndirectArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import { resolveBySymbol } from '@xyo-network/express-node-lib'
import { PointerPayload } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Payload } from '@xyo-network/payload-model'
import { Request } from 'express'

import { findPayload } from './findPayload'

export const resolvePointer = async (req: Request, pointer: PointerPayload): Promise<Payload | undefined> => {
  const { node } = req.app
  const module = await resolveBySymbol<IndirectArchivistModule>(node, TYPES.Archivist)
  const archivist =
    asArchivistInstance(module) ??
    asArchivistInstance(
      IndirectArchivistWrapper.wrap(asArchivistModule(module, `Failed to cast archivist ${module?.address}`)),
      `Failed to cast archivist wrapper ${module?.address}`,
    )
  const boundWitnessDiviner = await resolveBySymbol<BoundWitnessDiviner>(node, TYPES.BoundWitnessDiviner)
  const payloadDiviner = await resolveBySymbol<PayloadDiviner>(node, TYPES.PayloadDiviner)
  return findPayload(archivist, boundWitnessDiviner, payloadDiviner, pointer)
}

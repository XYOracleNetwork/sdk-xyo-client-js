import { exists } from '@xylabs/exists'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { requestCanAccessArchive, resolveBySymbol } from '@xyo-network/express-node-lib'
import { PayloadPointerPayload, payloadPointerSchema, XyoPayloadFilterPredicate, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { XyoPayload } from '@xyo-network/payload-model'
import { Request } from 'express'

import { resolvePayloadPointer } from './resolvePayloadPointer'

const findByHash = async (req: Request, hash: string) => {
  const { node } = req.app
  const payloadFilter: XyoPayloadFilterPredicate = { hash }
  const payloadArchivist = await resolveBySymbol(node, TYPES.PayloadArchivist)
  const payloadWrapper = new ArchivistWrapper(payloadArchivist)
  const payloads = (await payloadWrapper.find(payloadFilter)).filter(exists)

  if (payloads.length) return payloads

  const boundWitnessArchivist = await resolveBySymbol(node, TYPES.BoundWitnessArchivist)
  const boundWitnessWrapper = new ArchivistWrapper(boundWitnessArchivist)
  return (await boundWitnessWrapper.find({ ...payloadFilter, schema: XyoBoundWitnessSchema })).filter(exists)
}

export const getBlockForRequest = async (req: Request, hash: string): Promise<XyoPayload | undefined> => {
  for (const block of await findByHash(req, hash)) {
    const blockWithMeta = block as XyoPayloadWithMeta
    if (!blockWithMeta?._archive) {
      continue
    }
    if (await requestCanAccessArchive(req, blockWithMeta._archive)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return block.schema === payloadPointerSchema ? await resolvePayloadPointer(req, block as any as PayloadPointerPayload) : block
    }
  }
}

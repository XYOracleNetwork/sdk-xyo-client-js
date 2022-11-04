import { exists } from '@xylabs/exists'
import { XyoArchivistWrapper } from '@xyo-network/archivist'
import { requestCanAccessArchive } from '@xyo-network/express-node-lib'
import { PayloadPointerPayload, payloadPointerSchema, XyoPayloadFilterPredicate, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload'
import { Request } from 'express'

import { resolvePayloadPointer } from './resolvePayloadPointer'

const findByHash = async (req: Request, hash: string) => {
  const { payloadArchivist, boundWitnessArchivist } = req.app
  const payloadFilter: XyoPayloadFilterPredicate = { hash }

  const payloadWrapper = new XyoArchivistWrapper(payloadArchivist)
  const payloads = (await payloadWrapper.find(payloadFilter)).filter(exists)

  if (payloads.length) return payloads

  const boundWitnessWrapper = new XyoArchivistWrapper(boundWitnessArchivist)
  return (await boundWitnessWrapper.find({ ...payloadFilter, schema: 'network.xyo.boundwitness' })).filter(exists)
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

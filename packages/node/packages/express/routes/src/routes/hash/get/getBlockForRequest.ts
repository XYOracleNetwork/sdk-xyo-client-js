import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { requestCanAccessArchive } from '@xyo-network/express-node-lib'
import { PayloadPointerPayload, payloadPointerSchema, XyoPayloadFilterPredicate, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { XyoPayload } from '@xyo-network/payload'
import { Request } from 'express'

import { resolvePayloadPointer } from './resolvePayloadPointer'

const findByHash = async (req: Request, hash: string) => {
  const { node } = req.app
  const payloadFilter: XyoPayloadFilterPredicate = { hash }

  const payloadArchivists = await node.tryResolve({ name: [assertEx(TYPES.PayloadArchivist.description)] })
  const payloadArchivist = assertEx(payloadArchivists[0])
  const payloadWrapper = new ArchivistWrapper(payloadArchivist)
  const payloads = (await payloadWrapper.find(payloadFilter)).filter(exists)

  if (payloads.length) return payloads

  const boundWitnessArchivists = await node.tryResolve({ name: [assertEx(TYPES.BoundWitnessArchivist.description)] })
  const boundWitnessArchivist = assertEx(boundWitnessArchivists[0])
  const boundWitnessWrapper = new ArchivistWrapper(boundWitnessArchivist)
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

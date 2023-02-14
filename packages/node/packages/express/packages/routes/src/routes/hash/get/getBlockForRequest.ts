import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { PayloadPointerPayload, payloadPointerSchema } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Request } from 'express'

import { resolvePayloadPointer } from './resolvePayloadPointer'

export const getBlockForRequest = async (req: Request, hash: string): Promise<XyoPayload | undefined> => {
  const { archivist } = req.app
  const block = (await new ArchivistWrapper(archivist).get([hash])).pop()
  if (block) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return block.schema === payloadPointerSchema ? await resolvePayloadPointer(req, block as any as PayloadPointerPayload) : block
  }
}

import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { isPointerPayload } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { Request } from 'express'

import { resolvePointer } from './resolvePointer'

let archivist: ArchivistInstance

export const getBlockForRequest = async (req: Request, hash: string): Promise<Payload | undefined> => {
  if (!archivist) {
    const { node } = req.app
    archivist = asArchivistInstance(await node.resolve('Archivist'), 'Failed to cast module to ArchivistInstance')
  }
  const block = (await archivist.get([hash])).pop()
  if (block) {
    if (isPointerPayload(block)) {
      return await resolvePointer(req, block)
    }
    return block
  }
}

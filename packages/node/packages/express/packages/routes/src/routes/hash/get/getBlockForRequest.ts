import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { isPayloadPointer } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { Request } from 'express'

import { resolvePointer } from './resolvePointer'

let archivist: ArchivistWrapper

export const getBlockForRequest = async (req: Request, hash: string): Promise<Payload | undefined> => {
  if (!archivist) {
    const { node } = req.app
    const modules = await node.downResolver.resolve({ name: ['Archivist'] })
    const module = modules.pop()
    archivist = ArchivistWrapper.wrap(module)
  }
  const block = (await archivist.get([hash])).pop()
  if (block) {
    if (isPayloadPointer(block)) {
      return await resolvePointer(req, block)
    }
    return block
  }
}

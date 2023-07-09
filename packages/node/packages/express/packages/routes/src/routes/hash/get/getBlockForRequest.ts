import { ArchivistModule, asArchivistModule } from '@xyo-network/modules'
import { isPointerPayload } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { Request } from 'express'

import { resolvePointer } from './resolvePointer'

let archivist: ArchivistModule

export const getBlockForRequest = async (req: Request, hash: string): Promise<Payload | undefined> => {
  if (!archivist) {
    const { node } = req.app
    const modules = await node.downResolver.resolve({ name: ['Archivist'] })
    const module = modules.pop()
    archivist = asArchivistModule(module, 'Failed to cast archivist')
  }
  const block = (await archivist.get([hash])).pop()
  if (block) {
    if (isPointerPayload(block)) {
      return await resolvePointer(req, block)
    }
    return block
  }
}

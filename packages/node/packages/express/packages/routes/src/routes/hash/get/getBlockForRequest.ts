import { asArchivistInstance, asArchivistModule, DirectArchivistModule } from '@xyo-network/archivist-model'
import { IndirectArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { isPointerPayload } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { Request } from 'express'

import { resolvePointer } from './resolvePointer'

let archivist: DirectArchivistModule

export const getBlockForRequest = async (req: Request, hash: string): Promise<Payload | undefined> => {
  if (!archivist) {
    const { node } = req.app
    const module = await node.downResolver.resolve('Archivist')
    const wrapper = IndirectArchivistWrapper.wrap(asArchivistModule(module, `Failed to cast archivist ${module?.address}`))
    archivist = asArchivistInstance(wrapper, `Failed to cast archivist wrapper ${wrapper?.address}`)
  }
  const block = (await archivist.get([hash])).pop()
  if (block) {
    if (isPointerPayload(block)) {
      return await resolvePointer(req, block)
    }
    return block
  }
}

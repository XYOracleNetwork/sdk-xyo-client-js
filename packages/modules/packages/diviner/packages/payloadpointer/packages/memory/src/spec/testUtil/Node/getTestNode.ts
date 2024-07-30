import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload-memory'
import { PayloadPointerDivinerConfig, PayloadPointerDivinerConfigSchema } from '@xyo-network/diviner-payload-pointer-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeInstance } from '@xyo-network/node-model'

import { PayloadPointerDiviner } from '../../../Diviner.js'

export const getTestNode = async (): Promise<NodeInstance> => {
  const node = await MemoryNode.create()
  const archivist = await MemoryArchivist.create()
  const payloadDiviner = await MemoryPayloadDiviner.create()
  const boundWitnessDiviner = await MemoryBoundWitnessDiviner.create()
  const config: PayloadPointerDivinerConfig = {
    schema: PayloadPointerDivinerConfigSchema,
    archivist: archivist.address,
    payloadDiviner: payloadDiviner.address,
    boundWitnessDiviner: boundWitnessDiviner.address,
  }
  const payloadPointerDiviner = await PayloadPointerDiviner.create({ config })
  const children = [archivist, payloadDiviner, boundWitnessDiviner, payloadPointerDiviner]
  for (const child of children) {
    await node.register(child)
    await node.attach(child.address, true)
  }
  return node
}

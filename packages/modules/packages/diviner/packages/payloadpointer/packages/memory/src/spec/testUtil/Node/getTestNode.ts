import { assertEx } from '@xylabs/assert'
import { MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist-memory'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { BoundWitnessDivinerConfigSchema } from '@xyo-network/diviner-boundwitness-model'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload-memory'
import { PayloadDivinerConfigSchema } from '@xyo-network/diviner-payload-model'
import { PayloadPointerDivinerConfig, PayloadPointerDivinerConfigSchema } from '@xyo-network/diviner-payload-pointer-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeInstance } from '@xyo-network/node-model'

import { PayloadPointerDiviner } from '../../../Diviner.js'

export const ArchivistName = 'Archivist'
export const BoundWitnessDivinerName = 'BoundWitnessDiviner'
export const PayloadDivinerName = 'PayloadDiviner'
export const PayloadPointerDivinerName = 'PayloadPointerDiviner'

export const getTestNode = async (): Promise<NodeInstance> => {
  const node = await MemoryNode.create()
  const archivist = await MemoryArchivist.create({ config: { schema: MemoryArchivistConfigSchema, name: ArchivistName } })
  const payloadDiviner = await MemoryPayloadDiviner.create({ config: { schema: PayloadDivinerConfigSchema, name: PayloadDivinerName } })
  const boundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
    config: { schema: BoundWitnessDivinerConfigSchema, name: BoundWitnessDivinerName },
  })
  const config: PayloadPointerDivinerConfig = {
    schema: PayloadPointerDivinerConfigSchema,
    archivist: ArchivistName,
    payloadDiviner: PayloadDivinerName,
    boundWitnessDiviner: BoundWitnessDivinerName,
    name: PayloadPointerDivinerName,
  }
  const payloadPointerDiviner = await PayloadPointerDiviner.create({ config })
  const children = [archivist, payloadDiviner, boundWitnessDiviner, payloadPointerDiviner]
  for (const child of children) {
    await node.register(child)
    await node.attach(child.address, true)
  }
  return node
}

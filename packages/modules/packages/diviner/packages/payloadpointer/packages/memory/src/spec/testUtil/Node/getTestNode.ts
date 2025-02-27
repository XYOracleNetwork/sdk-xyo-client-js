import { MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist-memory'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { BoundWitnessDivinerConfigSchema } from '@xyo-network/diviner-boundwitness-model'
import { GenericPayloadDivinerConfigSchema } from '@xyo-network/diviner-payload-generic'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload-memory'
import type { PayloadPointerDivinerConfig } from '@xyo-network/diviner-payload-pointer-model'
import { PayloadPointerDivinerConfigSchema } from '@xyo-network/diviner-payload-pointer-model'
import { MemoryNode } from '@xyo-network/node-memory'
import type { NodeInstance } from '@xyo-network/node-model'

import { PayloadPointerDiviner } from '../../../Diviner.ts'

export const ArchivistName = 'Archivist'
export const BoundWitnessDivinerName = 'BoundWitnessDiviner'
export const PayloadDivinerName = 'PayloadDiviner'
export const PayloadPointerDivinerName = 'PayloadPointerDiviner'

export const getTestNode = async (): Promise<NodeInstance> => {
  const node = await MemoryNode.create({ account: 'random' })
  const archivist = await MemoryArchivist.create({ account: 'random', config: { schema: MemoryArchivistConfigSchema, name: ArchivistName } })
  const payloadDiviner = await MemoryPayloadDiviner.create({
    account: 'random',
    config: {
      schema: GenericPayloadDivinerConfigSchema, name: PayloadDivinerName, archivist: ArchivistName,
    },
  })
  const boundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
    account: 'random',
    config: {
      schema: BoundWitnessDivinerConfigSchema, name: BoundWitnessDivinerName, archivist: ArchivistName,
    },
  })
  const config: PayloadPointerDivinerConfig = {
    schema: PayloadPointerDivinerConfigSchema,
    archivist: ArchivistName,

    payloadDiviner: PayloadDivinerName,
    boundWitnessDiviner: BoundWitnessDivinerName,
    name: PayloadPointerDivinerName,
  }
  const payloadPointerDiviner = await PayloadPointerDiviner.create({ account: 'random', config })
  const children = [archivist, payloadDiviner, boundWitnessDiviner, payloadPointerDiviner]
  for (const child of children) {
    await node.register(child)
    await node.attach(child.address, true)
  }
  return node
}

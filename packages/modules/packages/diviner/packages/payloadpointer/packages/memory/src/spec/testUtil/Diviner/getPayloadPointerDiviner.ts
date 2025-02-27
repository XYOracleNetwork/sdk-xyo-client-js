import { asDivinerInstance } from '@xyo-network/diviner-model'
import { NodeInstance } from '@xyo-network/node-model'

import { PayloadPointerDiviner } from '../../../Diviner.ts'
import { getTestNode, PayloadPointerDivinerName } from '../Node/index.ts'

export const getPayloadPointerDiviner = async (node?: NodeInstance) => {
  if (!node) node = await getTestNode()
  return asDivinerInstance(await node?.resolve(PayloadPointerDivinerName)) as PayloadPointerDiviner
}

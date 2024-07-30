import { asDivinerInstance } from '@xyo-network/diviner-model'
import { NodeInstance } from '@xyo-network/node-model'

import { PayloadPointerDiviner } from '../../../Diviner.js'
import { getTestNode, PayloadPointerDivinerName } from '../Node/index.js'

export const getPayloadPointerDiviner = async (node?: NodeInstance) => {
  if (!node) node = await getTestNode()
  return asDivinerInstance(node?.resolve(PayloadPointerDivinerName)) as PayloadPointerDiviner
}

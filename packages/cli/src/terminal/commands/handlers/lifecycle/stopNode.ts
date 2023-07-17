import { NodeInstance } from '@xyo-network/node'

import { printTitle, stop } from '../../../../lib'

export const stopNode = async (_node: NodeInstance) => {
  printTitle('Stop Node')
  await stop()
}

import { NodeInstance } from '@xyo-network/node-model'

import { printTitle, restart } from '../../../../lib'

export const restartNode = async (_node: NodeInstance) => {
  printTitle('Restart Node')
  await restart()
}

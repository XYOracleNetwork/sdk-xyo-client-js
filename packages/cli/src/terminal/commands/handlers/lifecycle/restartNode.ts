import { NodeInstance } from '@xyo-network/node'

import { printTitle, restart } from '../../../../lib'

export const restartNode = async (_node: NodeInstance) => {
  printTitle('Restart Node')
  await restart()
}

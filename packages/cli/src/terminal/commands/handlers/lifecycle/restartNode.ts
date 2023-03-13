import { NodeModule } from '@xyo-network/node'

import { printTitle, restart } from '../../../../lib'

export const restartNode = async (_node: NodeModule) => {
  printTitle('Restart Node')
  await restart()
}

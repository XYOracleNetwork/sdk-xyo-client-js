import { DirectNodeModule } from '@xyo-network/node'

import { printTitle, restart } from '../../../../lib'

export const restartNode = async (_node: DirectNodeModule) => {
  printTitle('Restart Node')
  await restart()
}

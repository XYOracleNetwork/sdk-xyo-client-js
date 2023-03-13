import { NodeModule } from '@xyo-network/node'

import { printTitle, stop } from '../../../../lib'

export const stopNode = async (_node: NodeModule) => {
  printTitle('Stop Node')
  await stop()
}

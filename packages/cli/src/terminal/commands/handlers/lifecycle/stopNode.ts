import { DirectNodeModule } from '@xyo-network/node'

import { printTitle, stop } from '../../../../lib'

export const stopNode = async (_node: DirectNodeModule) => {
  printTitle('Stop Node')
  await stop()
}

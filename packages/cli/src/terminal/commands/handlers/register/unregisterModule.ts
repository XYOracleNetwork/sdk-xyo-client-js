import { DirectNodeModule } from '@xyo-network/node'

import { printError, printTitle } from '../../../../lib'

export const unregisterModule = (_node: DirectNodeModule) => {
  printTitle('Unregister Module')
  printError('TODO')
  return Promise.resolve()
}

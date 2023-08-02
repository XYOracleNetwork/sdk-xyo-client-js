import { NodeInstance } from '@xyo-network/node-model'

import { printLine, printTitle } from '../../../../lib'

export const listRegisteredModules = async (node: NodeInstance) => {
  printTitle('List Registered Modules')
  const addresses = await node.registered()
  addresses.forEach((address) => {
    printLine(`0x${address}`)
  })
}

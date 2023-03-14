import { NodeModule } from '@xyo-network/node'

import { printLine, printTitle } from '../../../../lib'

export const listRegisteredModules = async (node: NodeModule) => {
  printTitle('List Registered Modules')
  const addresses = await node.registered()
  addresses.forEach((address) => {
    printLine(`0x${address}`)
  })
}

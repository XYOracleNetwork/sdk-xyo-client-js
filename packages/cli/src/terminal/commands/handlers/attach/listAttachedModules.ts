import { NodeModule } from '@xyo-network/node'

import { printLine, printTitle } from '../../../../lib'

export const listAttachedModules = async (node: NodeModule) => {
  printTitle('List Attached Modules')

  const addresses = await node.attached()

  addresses.forEach((address) => {
    printLine(`0x${address}`)
  })
}

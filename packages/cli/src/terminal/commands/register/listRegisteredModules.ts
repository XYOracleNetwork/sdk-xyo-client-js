import { MemoryNode } from '@xyo-network/node'

import { printLine, printTitle } from '../../../lib'

export const listRegisteredModules = async (node: MemoryNode) => {
  printTitle('List Registered Modules')
  const mods = await node.registeredModules()
  mods.forEach((mod) => {
    printLine(`0x${mod.address}`)
  })
}

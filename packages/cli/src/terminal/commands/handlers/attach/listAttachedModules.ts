import { MemoryNode } from '@xyo-network/node'

import { printLine, printTitle } from '../../../../lib'

export const listAttachedModules = async (node: MemoryNode) => {
  printTitle('List Attached Modules')
  const mods = await node.attachedModules()
  mods.forEach((mod) => {
    printLine(`0x${mod.address}`)
  })
}

import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

import { newline } from '../../../lib'

export const listRegisteredModules = async (node: MemoryNode) => {
  newline()
  terminal.yellow('List Registered Modules')
  newline()
  const mods = await node.registeredModules()
  mods.forEach((mod) => {
    terminal(`0x${mod.address}`)
    newline()
  })
}

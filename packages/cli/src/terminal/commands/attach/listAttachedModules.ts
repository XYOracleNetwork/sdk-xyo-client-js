import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

import { newline } from '../../../lib'

export const listAttachedModules = async (node: MemoryNode) => {
  newline()
  terminal.yellow('List Attached Modules')
  newline()
  const mods = await node.attachedModules()
  mods.forEach((mod) => {
    terminal(`0x${mod.address}`)
    newline()
  })
}

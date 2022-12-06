import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

export const listAttachedModules = async (node: MemoryNode) => {
  terminal.yellow('\nList Attached Modules\n')
  const mods = await node.attachedModules()
  mods.forEach((mod) => {
    terminal(`0x${mod.address}`)
  })
}

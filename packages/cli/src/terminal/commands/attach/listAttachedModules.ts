import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

export const listAttachedModules = async (node: MemoryNode) => {
  terminal.yellow('\nList Attached Modules\n')
  const attachedModules = await node.attachedModules()
  attachedModules.forEach((module) => {
    terminal(`0x${module}`)
  })
}

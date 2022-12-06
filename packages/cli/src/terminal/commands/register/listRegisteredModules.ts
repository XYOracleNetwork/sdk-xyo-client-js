import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

export const listRegisteredModules = async (node: MemoryNode) => {
  terminal.yellow('\nList Registered Modules\n')
  const mods = await node.registeredModules()
  mods.forEach((mod) => {
    terminal(`0x${mod.address}`)
  })
}

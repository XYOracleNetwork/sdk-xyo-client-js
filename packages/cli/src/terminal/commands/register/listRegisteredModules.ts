import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

export const listRegisteredModules = async (node: MemoryNode) => {
  terminal.yellow('\nList Registered Modules\n')
  const registered = await node.registered()
  registered.forEach((module) => {
    terminal(`0x${module}`)
  })
}

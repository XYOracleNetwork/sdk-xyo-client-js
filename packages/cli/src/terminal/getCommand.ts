import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

import { printLine } from '../lib'
import {
  attachModule,
  describeNode,
  detachModule,
  listAttachedModules,
  listRegisteredModules,
  registerModule,
  showConfig,
  status,
  terminalItems,
  unregisterModule,
} from './commands'

export const getCommand = (node: MemoryNode): Promise<boolean> => {
  return new Promise((resolve) => {
    terminal.once('key', (name: string) => {
      if (name === 'ESCAPE') resolve(true)
      if (name === 'CTRL_C') resolve(false)
    })
    terminal.singleColumnMenu(
      terminalItems.map((item) => item.text),
      async (error, response) => {
        if (error) {
          printLine(`Error: ${error}`, 'red')
        }
        switch (terminalItems[response.selectedIndex].slug) {
          case 'attach-module':
            await attachModule(node)
            break
          case 'describe-node':
            await describeNode(node)
            break
          case 'detach-module':
            await detachModule(node)
            break
          case 'exit':
            resolve(false)
            break
          case 'list-attached-modules':
            await listAttachedModules(node)
            break
          case 'list-registered-modules':
            await listRegisteredModules(node)
            break
          case 'register-module':
            await registerModule(node)
            break
          case 'status':
            await status(node)
            break
          case 'show-config':
            await showConfig()
            break
          case 'unregister-module':
            await unregisterModule(node)
            break
        }
        resolve(true)
      },
    )
  })
}

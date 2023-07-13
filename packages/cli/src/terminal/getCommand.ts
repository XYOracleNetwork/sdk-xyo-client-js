import { IndirectNodeModule, NodeWrapper } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

import { printLine } from '../lib'
import {
  attachModule,
  describeNode,
  detachModule,
  listAttachedModules,
  listRegisteredModules,
  nodeLogs,
  registerModule,
  restartNode,
  showConfig,
  status,
  stopNode,
  terminalItems,
  unregisterModule,
} from './commands'

export const getCommand = (node: IndirectNodeModule): Promise<boolean> => {
  const wrapper = NodeWrapper.wrap(node)
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
            await attachModule(wrapper)
            break
          case 'describe-node':
            await describeNode(wrapper)
            break
          case 'detach-module':
            await detachModule(wrapper)
            break
          case 'exit':
            resolve(false)
            break
          case 'list-attached-modules':
            await listAttachedModules(wrapper)
            break
          case 'list-registered-modules':
            await listRegisteredModules(wrapper)
            break
          case 'node-logs':
            await nodeLogs(wrapper)
            break
          case 'register-module':
            await registerModule(wrapper)
            break
          case 'restart-node':
            await restartNode(wrapper)
            break
          case 'status':
            await status(wrapper)
            break
          case 'stop-node':
            await stopNode(wrapper)
            break
          case 'show-config':
            await showConfig()
            break
          case 'unregister-module':
            await unregisterModule(wrapper)
            break
        }
        resolve(true)
      },
    )
  })
}

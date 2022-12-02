import { XyoModuleConfig } from '@xyo-network/module'
import { MemoryNode, Node } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

import { readFileDeep } from './readFileDeep'

interface TerminalItem {
  slug: string
  text: string
}

const terminalCommands = [
  'Register Module',
  'Unregister Module',
  'List Registered Modules',
  'Attach Module',
  'Detach Module',
  'List Attached Modules',
  'Show Config',
  'Status',
  'Exit',
]

const items: TerminalItem[] = terminalCommands.map((item, index) => {
  return {
    slug: item.toLowerCase().replaceAll(' ', '-'),
    text: `${index + 1}. ${item}`,
  }
})

const getCommand = (node: Node): Promise<boolean> => {
  return new Promise((resolve) => {
    terminal.once('key', (name: string) => {
      if (name === 'ESCAPE') {
        resolve(true)
      }
      if (name === 'CTRL_C') {
        resolve(false)
      }
    })
    terminal.green('\nXYO Node Running\n')
    terminal.singleColumnMenu(
      items.map((item) => item.text),
      async (error, response) => {
        if (error) {
          terminal.red(`Error: ${error}`)
        }
        switch (items[response.selectedIndex].slug) {
          case 'exit':
            resolve(false)
            break
          case 'list-registered-modules': {
            terminal.yellow('\nList Registered Modules\n')
            const registered = await node?.registered()
            registered.forEach((module) => {
              terminal(`0x${module}`)
            })
            break
          }
          case 'register-module':
            terminal.yellow('\nRegister Module\n')
            break
          case 'show-config': {
            const [config, path] = readFileDeep(['xyo-config.json', 'xyo-config.js'])
            let configObj: XyoModuleConfig | undefined
            terminal.yellow(`\nConfig found at: ${path}\n`)
            if (config) {
              if (path?.endsWith('.json')) {
                configObj = JSON.parse(config) as XyoModuleConfig
              } else if (path?.endsWith('.cjs') || path?.endsWith('.js')) {
                configObj = (await import(path)) as XyoModuleConfig
              }
            }
            terminal(JSON.stringify(configObj ?? {}))
            break
          }
        }
        resolve(true)
      },
    )
  })
}

function terminate() {
  terminal.grabInput(false)
  terminal.clear()
  terminal.green('\n\nXYO Node Shutdown - Bye\n\n')
  setTimeout(function () {
    process.exit()
  }, 100)
}

export const startTerminal = async (node: MemoryNode) => {
  let running = true
  while (running) {
    running = await getCommand(node)
  }
  terminate()
}

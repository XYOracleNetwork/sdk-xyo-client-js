import { XyoModuleConfig } from '@xyo-network/module'
import { MemoryNode, Node } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

import { readFileDeep, terminate } from './lib'
import { terminalItems } from './terminalItems'

const getCommand = (node: Node): Promise<boolean> => {
  return new Promise((resolve) => {
    terminal.once('key', (name: string) => {
      if (name === 'ESCAPE') resolve(true)
      if (name === 'CTRL_C') resolve(false)
    })
    terminal.green('\nXYO Node Running\n')
    terminal.singleColumnMenu(
      terminalItems.map((item) => item.text),
      async (error, response) => {
        if (error) {
          terminal.red(`Error: ${error}`)
        }
        switch (terminalItems[response.selectedIndex].slug) {
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

export const startTerminal = async (node: MemoryNode) => {
  let running = true
  await terminal.drawImage('./packages/cli/src/xyo_logo_full_white.png', { shrink: { height: 10, width: 10 } })
  while (running) {
    running = await getCommand(node)
  }
  terminate()
}

import { XyoModuleConfig } from '@xyo-network/module'
import { MemoryNode, Node } from '@xyo-network/node'
import { readFileSync } from 'fs'
import path from 'path'
import { terminal } from 'terminal-kit'

function terminate() {
  terminal.grabInput(false)
  terminal.clear()
  terminal.green('\n\nXYO Node Shutdown - Bye\n\n')
  setTimeout(function () {
    process.exit()
  }, 100)
}

const readFileDeep = (names: string[]) => {
  let depth = 0
  let result: string | undefined
  let filename
  let resolvedPath
  while (depth < 10 && result === undefined) {
    names.forEach((name) => {
      if (result === undefined) {
        filename = name
        for (let i = 0; i < depth; i++) {
          filename = `../${filename}`
        }
        resolvedPath = path.resolve(filename)
        try {
          result = readFileSync(resolvedPath, { encoding: 'utf8' })
        } catch (ex) {
          const error = ex as NodeJS.ErrnoException
          if (error.code !== 'ENOENT') {
            terminal.red(`${JSON.stringify(error)}\n`)
          }
        }
      }
    })
    depth++
  }
  return [result, resolvedPath]
}

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
    const items = [
      'Register Module',
      'Unregister Module',
      'List Registered Modules',
      'Attach Module',
      'Detach Module',
      'List Attached Modules',
      'Show Config',
      'Status',
      'Exit',
    ].map((item, index) => {
      return {
        slug: item.toLowerCase().replaceAll(' ', '-'),
        text: `${index + 1}. ${item}`,
      }
    })
    //terminal.clear()
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

export const startTerminal = async (node: MemoryNode) => {
  let running = true
  while (running) {
    running = await getCommand(node)
  }

  terminate()
}

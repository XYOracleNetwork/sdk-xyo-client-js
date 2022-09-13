import { terminal } from 'terminal-kit'

function terminate() {
  terminal.grabInput(false)
  terminal.clear()
  terminal.green('\n\nXYO Node Shutdown - Bye\n\n')
  setTimeout(function () {
    process.exit()
  }, 100)
}

const getCommand = (): Promise<boolean> => {
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
      'Register Plugin',
      'Unregister Plugin',
      'List Registered Plugins',
      'Attach Plugin',
      'Detatch Plugin',
      'List Attached Plugins',
      'Show Config',
      'Status',
      'Exit',
    ].map((item, index) => {
      return {
        slug: item.toLowerCase().replaceAll(' ', '-'),
        text: `${index + 1}. ${item}`,
      }
    })
    terminal.clear()
    terminal.green('\nXYO Node Running\n')
    terminal.singleColumnMenu(
      items.map((item) => item.text),
      (error, response) => {
        terminal.removeListener('key', id)
        if (error) {
          terminal.red(`Error: ${error}`)
        }
        switch (items[response.selectedIndex].slug) {
          case 'exit':
            resolve(false)
            break
          case 'register-plugin':
            terminal.yellow('Register Plugin')
            break
        }
        resolve(true)
      },
    )
  })
}

export const startTerminal = async () => {
  let running = true
  while (running) {
    running = await getCommand()
  }

  terminate()
}

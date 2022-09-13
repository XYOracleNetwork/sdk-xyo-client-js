import path from 'path'
import { terminal } from 'terminal-kit'

import xyo_logo_black from './xyo_logo_black.png'

const commands = ['exit', 'plugin']

const getCommand = (): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    terminal.inputField({ autoComplete: commands, autoCompleteMenu: true }, (error, input) => {
      terminal('\n')
      if (error) {
        reject(error)
      } else {
        resolve(input)
      }
    })
  })
}

export const startTerminal = async () => {
  const imagePath = path.resolve(__dirname, xyo_logo_black)
  await terminal.drawImage(imagePath)
  terminal.green('XYO Node Started\n\n')
  terminal.green("Type 'exit' to exit\n\n")

  let running = true

  while (running) {
    const command = await getCommand()
    if (command === 'exit') {
      running = false
    }
  }
  process.exit(0)
}

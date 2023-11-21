import { terminal } from 'terminal-kit'

import { printLine } from '../lib'

export const stopTerminal = () => {
  terminal.grabInput(false)
  terminal.clear()
  printLine('XYO Node Shutdown - Bye', 'green')
  setTimeout(() => process.exit(), 100)
}

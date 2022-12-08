import { terminal } from 'terminal-kit'

export const terminate = () => {
  terminal.grabInput(false)
  terminal.clear()
  terminal.green('\n\nXYO Node Shutdown - Bye\n\n')
  setTimeout(() => process.exit(), 100)
}

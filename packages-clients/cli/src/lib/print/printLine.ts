import { terminal } from 'terminal-kit'

import { newline } from './newline'

export type TextColor = 'green' | 'yellow' | 'red' | 'default'

export const printLine = (text?: string | undefined, color: TextColor = 'default') => {
  switch (color) {
    case 'green':
      terminal.green(text)
      break
    case 'yellow':
      terminal.yellow(text)
      break
    case 'red':
      terminal.red(text)
      break
    case 'default':
      terminal(text)
  }
  newline()
}

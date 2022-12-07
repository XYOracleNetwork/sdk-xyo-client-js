import { terminal } from 'terminal-kit'

import { newline } from './newline'

export type TextColor = 'yellow' | 'red' | 'default'

export const printLine = (text?: string | undefined, color: TextColor = 'default') => {
  switch (color) {
    case 'red':
      terminal.red(text)
      break
    case 'yellow':
      terminal.yellow(text)
      break
    default:
      terminal(text)
  }
  newline()
}

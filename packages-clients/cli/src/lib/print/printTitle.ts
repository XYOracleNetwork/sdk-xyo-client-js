import { newline } from './newline'
import { printLine } from './printLine'

export const printTitle = (text?: string | undefined) => {
  newline()
  printLine(text, 'yellow')
}

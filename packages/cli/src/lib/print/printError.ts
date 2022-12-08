import { printLine } from './printLine'

export const printError = (text?: string | undefined) => {
  printLine(text, 'red')
}

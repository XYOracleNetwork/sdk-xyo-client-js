import { terminalCommands } from './commands'

interface TerminalItem {
  slug: string
  text: string
}

export const terminalItems: TerminalItem[] = terminalCommands.map((item, index) => {
  return {
    slug: item.toLowerCase().replaceAll(' ', '-'),
    text: `${index + 1}. ${item}`,
  }
})

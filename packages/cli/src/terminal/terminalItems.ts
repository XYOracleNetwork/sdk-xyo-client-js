interface TerminalItem {
  slug: string
  text: string
}

export const terminalCommands = [
  'Register Module',
  'Unregister Module',
  'List Registered Modules',
  'Attach Module',
  'Detach Module',
  'List Attached Modules',
  'Show Config',
  'Status',
  'Exit',
]

export const terminalItems: TerminalItem[] = terminalCommands.map((item, index) => {
  return {
    slug: item.toLowerCase().replaceAll(' ', '-'),
    text: `${index + 1}. ${item}`,
  }
})

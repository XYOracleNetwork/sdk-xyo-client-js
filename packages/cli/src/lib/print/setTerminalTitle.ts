import { terminal } from 'terminal-kit'

export const setTerminalTitle = (title = 'XYO Node') => {
  terminal.appName = 'APP Name'
  // NOTE: String-building here because octal escape
  // sequences are not allowed in template strings
  terminal('\x1B]0;' + title + '\x07')
}

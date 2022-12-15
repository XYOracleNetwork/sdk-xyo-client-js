import { terminal } from 'terminal-kit'

/**
 * Sets the title of the terminal
 * @param title The title, defaults to 'XYO'
 */
export const setTerminalTitle = (title = 'XYO') => {
  // NOTE: String-building here because escape
  // sequences are not allowed in template strings
  // in strict mode
  terminal('\x1B]0;' + title + '\x07')
}

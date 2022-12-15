import { terminal } from 'terminal-kit'

/**
 * Sets the title of the terminal
 * @param title The title, defaults to 'XYO'
 */
export const setTerminalTitle = (title = 'XYO') => {
  terminal(`\x1B]0;${title}\x07`)
}

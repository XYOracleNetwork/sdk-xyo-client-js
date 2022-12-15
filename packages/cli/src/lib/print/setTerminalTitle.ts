import { terminal } from 'terminal-kit'

/**
 * Sets the title of the terminal/icon
 * @param title The title, defaults to 'XYO'
 */
export const setTerminalTitle = (title = 'XYO') => {
  terminal.windowTitle(title)
  terminal(`\x1B]0;${title}\x07`)
  terminal.iconName(title)
}

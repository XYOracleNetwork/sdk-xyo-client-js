import { terminal } from 'terminal-kit'

/**
 * Sets the title of the terminal
 * @param title The title, defaults to 'XYO'
 */
export const setTerminalTitle = (title = 'XYO') => {
  terminal.windowTitle(title)
}

import { terminal } from 'terminal-kit'

export const printLogo = async () => {
  const shrink = { height: 12, width: 54 }
  await terminal.drawImage('./packages/cli/src/cli-art-simple.png', { shrink })
}

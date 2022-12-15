import { existsSync } from 'fs'
import { join } from 'path'
import { terminal } from 'terminal-kit'

const fileRelativePath = join(__dirname, '..', '..', 'cli-art-simple.png')
const projectRelativePath = './packages/cli/src/cli-art-simple.png'

export const printLogo = async () => {
  const shrink = { height: 12, width: 54 }
  try {
    const image = [fileRelativePath, projectRelativePath].find(existsSync)
    if (image?.length) {
      await terminal.drawImage(image, { shrink })
    }
  } catch (err) {
    // Stat throws if image doesn't exist
  }
}

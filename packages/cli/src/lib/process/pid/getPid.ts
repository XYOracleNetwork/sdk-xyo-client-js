import { readFile, stat } from 'fs/promises'

import { pidFile } from './files'

const encoding = 'utf-8'

export const getPid = async (): Promise<number | undefined> => {
  try {
    const exists = (await stat(pidFile)).isFile()
    if (exists) {
      const data = await readFile(pidFile, { encoding })
      const pid = parseInt(data)
      if (pid) return pid
    }
  } catch (_err) {
    // stat can throw if file doesn't exist
  }
  return undefined
}

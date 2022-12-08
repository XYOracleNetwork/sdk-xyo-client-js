import { stat, unlink } from 'fs/promises'

import { pidFile } from '../files'

export const clearPid = async () => {
  try {
    const exists = (await stat(pidFile)).isFile()
    if (exists) {
      await unlink(pidFile)
    }
  } catch {
    // stat can throw if file doesn't exist
  }
}

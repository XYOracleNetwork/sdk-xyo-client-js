import { stat, unlink } from 'fs/promises'

export const deleteFile = async (path: string) => {
  try {
    const exists = (await stat(path)).isFile()
    if (exists) {
      await unlink(path)
    }
  } catch {
    // stat can throw if file doesn't exist
  }
}

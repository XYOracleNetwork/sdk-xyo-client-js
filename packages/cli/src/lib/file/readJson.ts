import { readFile, stat } from 'fs/promises'

export const readJson = async <T>(file: string): Promise<T | undefined> => {
  try {
    if ((await stat(file)).isFile()) {
      const data = await readFile(file, { encoding: 'utf-8' })
      if (data) return JSON.parse(data) as T
    }
  } catch (_error) {
    // File doesn't exist or is corrupt
  }
  return undefined
}

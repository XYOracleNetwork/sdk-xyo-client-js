import { stat, writeFile } from 'fs/promises'
import merge from 'lodash/merge'

import { readJson } from './readJson'

export const writeJson = async (file: string, data: object): Promise<object | undefined> => {
  let previous: object = {}
  try {
    if ((await stat(file)).isFile()) {
      const existing = await readJson<object>(file)
      if (existing) previous = existing
    }
  } catch (_error) {
    // File doesn't exist or is corrupt
  }
  data = merge(previous, data)
  await writeFile(file, JSON.stringify(data), { encoding: 'utf-8' })
  return data
}

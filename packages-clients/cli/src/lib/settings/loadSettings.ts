import { readJson } from '../file'
import { settingsFile } from './files'
import { Settings } from './Settings'

export const loadSettings = (): Promise<Settings | undefined> => {
  return readJson<Settings>(settingsFile)
}

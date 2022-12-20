import { writeJson } from '../file'
import { settingsFile } from './files'
import { Settings } from './Settings'

export const saveSettings = async (settings: Settings): Promise<void> => {
  await writeJson(settingsFile, settings)
}

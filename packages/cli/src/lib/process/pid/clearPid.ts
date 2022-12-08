import { deleteFile } from '../../file'
import { pidFile } from '../files'

export const clearPid = async () => {
  await deleteFile(pidFile)
}

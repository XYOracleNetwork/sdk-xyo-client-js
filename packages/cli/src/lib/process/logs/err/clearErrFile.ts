import { deleteFile } from '../../../file'
import { errFile } from '../files'

export const clearErrFile = () => {
  return deleteFile(errFile)
}

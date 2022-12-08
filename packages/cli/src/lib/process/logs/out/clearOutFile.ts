import { deleteFile } from '../../../file'
import { outFile } from '../files'

export const clearOutFile = () => {
  return deleteFile(outFile)
}

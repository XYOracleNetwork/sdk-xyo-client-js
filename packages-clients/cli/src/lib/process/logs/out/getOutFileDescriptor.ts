import { openSync } from 'fs'

import { outFile } from '../files'

export const getOutFileDescriptor = () => {
  return openSync(outFile, 'a+')
}

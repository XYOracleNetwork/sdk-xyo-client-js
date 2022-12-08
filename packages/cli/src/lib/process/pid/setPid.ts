import { writeFile } from 'fs/promises'

import { pidFile } from '../files'

export const setPid = async (pid: number | undefined) => {
  if (pid) {
    await writeFile(pidFile, `${pid}`)
  }
}

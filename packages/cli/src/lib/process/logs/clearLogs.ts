import { clearErrFile } from './err'
import { clearOutFile } from './out'

export const clearLogs = async () => {
  await clearOutFile()
  await clearErrFile()
}

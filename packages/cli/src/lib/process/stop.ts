import { kill } from 'process'

import { isRunning } from './isRunning'
import { clearPid, getPid } from './pid'

export const stop = async () => {
  const pid = await getPid()
  if (pid && (await isRunning())) {
    // TODO: Send SIGHUP, then SIGKILL
    kill(pid)
    // TODO: Poll until stopped
  }
  await clearPid()
}

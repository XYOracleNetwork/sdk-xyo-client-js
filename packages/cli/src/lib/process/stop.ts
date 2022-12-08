import { kill } from 'process'

import { getPid } from './pid'

export const stop = async () => {
  const pid = await getPid()
  if (pid) {
    // TODO: Send SIGHUP, then SIGKILL
    kill(pid)
    // TODO: Poll until stopped
  }
}

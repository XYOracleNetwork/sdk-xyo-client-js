import { kill as sendSignalToProcess } from 'process'

import { clearPid, getPid } from './pid'

/**
 * Signal to send to process to check for existence
 *
 * From the docs:
 *
 * https://nodejs.org/api/process.html#signal-events
 *
 * Specifically:
 *
 * "0 can be sent to test for the existence of a process, it has no
 * effect if the process exists, but will throw an error if the
 * process does not exist."
 *
 * and
 *
 * "Sending signal 0 can be used as a platform independent way to
 * test for the existence of a process."
 */
const existsSignal = 0

/**
 * Checks if the Node process is running
 * @returns True if the Node process is running, false otherwise
 */
export const isRunning = async (): Promise<boolean> => {
  const pid = await getPid()
  if (pid) {
    try {
      sendSignalToProcess(pid, existsSignal)
      return true
    } catch {
      // Remove PID file here since it's outdated/invalid
      await clearPid()
      return false
    }
  }
  return false
}

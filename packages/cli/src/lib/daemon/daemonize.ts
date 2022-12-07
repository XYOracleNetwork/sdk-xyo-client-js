import { spawn } from 'child_process'
import { open } from 'fs/promises'

export const daemonizeNode = async () => {
  const logFile = '/tmp/xyo.log'
  const fdOut = await open(logFile, 'a+')
  const fdErr = await open(logFile, 'a+')
  const bin = 'while true; do sleep 1 && date; done;'
  const args: ReadonlyArray<string> = []

  const daemon = spawn(bin, args, {
    detached: true,
    env: process.env,
    stdio: ['ignore', fdOut.fd, fdErr.fd],
  })
  daemon.unref()
}

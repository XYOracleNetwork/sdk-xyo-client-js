import { spawn } from 'child_process'
import { openSync } from 'fs'

export const daemonizeNode = (): number | undefined => {
  const logFile = '/tmp/xyo.log'
  const out = openSync(logFile, 'a+')
  const err = openSync(logFile, 'a+')
  const bin = 'tail'
  const args: ReadonlyArray<string> = ['-f', 'package.json']
  const daemon = spawn(bin, args, {
    detached: true,
    env: process.env,
    stdio: ['ignore', out, err],
  })
  daemon.unref()
  return daemon.pid
}

import { spawn } from 'child_process'

export const daemonizeNode = () => {
  const bin = 'tail'
  const args: ReadonlyArray<string> = ['-f', 'package.json']
  const daemon = spawn(bin, args, {
    detached: true,
    env: process.env,
    stdio: ['ignore', 'ignore', 'ignore'],
  })
  daemon.unref()
}

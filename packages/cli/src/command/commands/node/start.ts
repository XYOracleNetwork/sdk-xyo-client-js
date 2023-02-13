import { EmptyObject } from '@xyo-network/core'
import { createReadStream } from 'fs'
import { ArgumentsCamelCase, CommandBuilder, CommandModule } from 'yargs'

import { errFile, outFile, start, stop } from '../../../lib'
import { BaseArguments } from '../../BaseArguments'

type Arguments = BaseArguments & {
  interactive?: boolean
}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = {
  interactive: {
    boolean: true,
    default: false,
  },
}
export const command = 'start'
export const deprecated = false
export const describe = 'Start the local XYO Node'
export const handler = async (args: ArgumentsCamelCase<Arguments>) => {
  args.output = 'raw'
  const daemonize = args.interactive || true
  await start(daemonize)
  if (!daemonize) {
    const stdout = createReadStream(outFile)
    const stderr = createReadStream(errFile)
    stdout.pipe(process.stdout)
    stderr.pipe(process.stderr)
    const terminated = new Promise<void>((resolve) => {
      process.on('SIGINT', () => resolve()) // CTRL+C
      process.on('SIGQUIT', () => resolve()) // Keyboard quit
      process.on('SIGTERM', () => resolve()) // `kill` command
    })
    await terminated
    await stop()
  }
}

const mod: CommandModule<EmptyObject, BaseArguments> = {
  aliases,
  command,
  deprecated,
  describe,
  handler,
}

// eslint-disable-next-line import/no-default-export
export default mod

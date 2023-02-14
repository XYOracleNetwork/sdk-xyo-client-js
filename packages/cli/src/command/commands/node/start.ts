import { EmptyObject } from '@xyo-network/core'
import { Tail } from 'tail'
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
    default: true,
  },
}
export const command = 'start'
export const deprecated = false
export const describe = 'Start the local XYO Node'
export const handler = async (args: ArgumentsCamelCase<Arguments>) => {
  const interactive = args.interactive || true
  await start()
  if (interactive) {
    const outInterface = new Tail(outFile)
    outInterface.on('line', console.log)

    const errInterface = new Tail(errFile)
    errInterface.on('line', console.error)

    const cleanup = async () => {
      outInterface.unwatch()
      errInterface.unwatch()
      await stop()
    }
    // CTRL+C
    process.on('SIGINT', async () => {
      await cleanup()
      process.exit()
    })
    // Keyboard quit
    process.on('SIGQUIT', async () => {
      await cleanup()
      process.exit()
    })
    // `kill` command
    process.on('SIGTERM', async () => {
      await cleanup()
      process.exit()
    })
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

import { EmptyObject } from '@xyo-network/core'
import { Tail } from 'tail'
import { ArgumentsCamelCase, CommandBuilder, CommandModule, Options } from 'yargs'

import { errFile, outFile, restart, stop } from '../../../lib'
import { BaseArguments } from '../../BaseArguments'

type Arguments = BaseArguments & {
  interactive?: boolean
}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = {
  interactive: {
    alias: ['i'],
    boolean: true,
    default: false,
  } as Options,
}
export const command = 'start'
export const deprecated = false
export const describe = 'Start the local XYO Node'
export const handler = async (args: ArgumentsCamelCase<Arguments>) => {
  const interactive = args.interactive
  await restart()
  if (interactive) {
    const outInterface = new Tail(outFile)
    const errInterface = new Tail(errFile)

    outInterface.on('line', console.log)
    errInterface.on('line', console.error)

    const shutdown = async () => {
      outInterface.unwatch()
      errInterface.unwatch()
      await stop()
    }

    // CTRL+C
    process.on('SIGINT', async () => {
      await shutdown()
      process.exit()
    })
    // Keyboard quit
    process.on('SIGQUIT', async () => {
      await shutdown()
      process.exit()
    })
    // `kill` command
    process.on('SIGTERM', async () => {
      await shutdown()
      process.exit()
    })
  } else {
    process.exit()
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

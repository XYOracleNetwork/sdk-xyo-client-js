import { EmptyObject } from '@xyo-network/core'
import { ArgumentsCamelCase, CommandBuilder, CommandModule } from 'yargs'

import { start } from '../../../lib'
import { BaseArguments } from '../../BaseArguments'

type Arguments = BaseArguments & {
  detach?: boolean
  interactive?: boolean
}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = {
  detach: {
    boolean: true,
    default: true,
  },
  force: {
    alias: ['f'],
    boolean: true,
    default: false,
    describe: 'Forcefully attempt the operation by stopping processes on suspected app port',
    type: 'boolean',
  },
  interactive: {
    boolean: true,
    default: false,
  },
}
export const command = 'start'
export const deprecated = false
export const describe = 'Start the local XYO Node'
export const handler = async (args: ArgumentsCamelCase<Arguments>) => {
  await start()
  if (args.interactive) {
    // TODO: Connect to stdio
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

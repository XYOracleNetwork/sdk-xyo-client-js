import { EmptyObject } from '@xyo-network/core'
import { ArgumentsCamelCase, CommandBuilder, CommandModule, Options } from 'yargs'

import { restart } from '../../../lib'
import { BaseArguments } from '../../BaseArguments'
import { outputContext } from '../../util'

type Arguments = BaseArguments & {
  force?: boolean
}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = {
  force: {
    alias: ['f'],
    boolean: true,
    default: false,
    describe: 'Forcefully attempt the operation by stopping processes on suspected app port',
    type: 'boolean',
  } as Options,
}
export const command = 'restart'
export const deprecated = false
export const describe = 'restart the local XYO Node'
export const handler = async (args: ArgumentsCamelCase<Arguments>) => {
  await outputContext(args, async (log) => {
    log('Restarting')
    await restart()
    log('Restarted')
  })
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

import { EmptyObject } from '@xyo-network/core'
import { ArgumentsCamelCase, CommandBuilder, CommandModule } from 'yargs'

import { stop } from '../../../lib'
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
  },
}
export const command = 'stop'
export const deprecated = false
export const describe = 'stop the local XYO Node'
export const handler = async (args: ArgumentsCamelCase<Arguments>) => {
  await outputContext(args, async () => {
    await stop()
  })
}

const mod: CommandModule<EmptyObject, Arguments> = {
  aliases,
  command,
  deprecated,
  describe,
  handler,
}

// eslint-disable-next-line import/no-default-export
export default mod

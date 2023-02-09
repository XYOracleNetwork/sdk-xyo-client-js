import { EmptyObject } from '@xyo-network/core'
import { open } from 'fs/promises'
import { ArgumentsCamelCase, CommandBuilder, CommandModule } from 'yargs'

import { getPid, start } from '../../../lib'
import { BaseArguments } from '../../BaseArguments'
import { outputContext } from '../../util'

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
  await outputContext(args, async (out, err) => {
    await start()
    // if (args.interactive) {
    if (true) {
      const pid = await getPid()
      if (pid) {
        const fd = await open(`/proc/${pid}/fd/1`)
        const stream = fd.createReadStream()
        stream.pipe(process.stdout)
      }
    }
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

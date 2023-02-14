import { EmptyObject } from '@xyo-network/core'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
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
  // process.on('SIGINT', () => {
  //   console.log('Bye!')
  //   process.exit()
  // })
  const interactive = args.interactive || true
  console.log(args)
  await start()
  if (interactive) {
    // const nodeStdOut = createReadStream(outFile, { autoClose: true, encoding: 'utf-8' })
    // const nodeStdErr = createReadStream(errFile, { autoClose: true, encoding: 'utf-8' })
    const nodeStdOut = createReadStream(outFile, { encoding: 'utf-8' })
    const nodeStdErr = createReadStream(errFile, { encoding: 'utf-8' })

    // nodeStdOut.pipe(process.stdout)
    // nodeStdErr.pipe(process.stderr)
    const outInterface = createInterface({ input: nodeStdOut })
    outInterface.on('line', (input) => {
      console.log(input)
    })

    const errInterface = createInterface({ input: nodeStdErr })
    errInterface.on('line', (input) => {
      console.error(input)
    })

    const cleanup = async () => {
      outInterface.close()
      errInterface.close()
      nodeStdOut.close()
      nodeStdErr.close()
      await stop()
    }

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

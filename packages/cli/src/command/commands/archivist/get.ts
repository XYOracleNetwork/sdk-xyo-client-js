import { EmptyObject } from '@xyo-network/core'
import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

import { printError, printLine } from '../../../lib'
import { ModuleArguments } from '../ModuleArguments'
import { getArchivist } from './util'

type Arguments = ModuleArguments & {
  hashes: string[]
}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs
    .usage('Usage: $0 archivist get <address> <hashes..>')
    .positional('address', { demandOption: true, type: 'string' })
    .positional('hashes', { array: true, demandOption: true, type: 'string' })
    .version(false)

export const command = 'get <address> <hashes..>'
export const deprecated = false
export const describe = 'Get payload(s) from the Archivist by hash'
export const handler = async (argv: ArgumentsCamelCase<Arguments>) => {
  const { hashes, verbose } = argv
  try {
    const archivist = await getArchivist(argv)
    const result = await archivist.get(hashes)
    printLine(JSON.stringify(result))
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Error querying archivist')
  }
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

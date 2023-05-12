import { EmptyObject } from '@xyo-network/core'
import { Argv, CommandBuilder, CommandModule } from 'yargs'

import { printError, printLine } from '../../../lib'
import { ModuleArguments } from '../ModuleArguments'
import { getModuleFromArgs } from '../util'

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs.usage('Usage: $0 module queries <address>').positional('address', { demandOption: true, type: 'string' })
export const command = 'queries <address>'
export const deprecated = false
export const describe = 'Issue a queries query against the XYO Module'
export const handler = async (argv: ModuleArguments) => {
  const { verbose } = argv
  try {
    const mod = await getModuleFromArgs(argv)
    const result = mod.queries
    printLine(JSON.stringify(result))
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Error Querying Module')
  }
}

const mod: CommandModule<EmptyObject, ModuleArguments> = {
  aliases,
  command,
  deprecated,
  describe,
  handler,
}

// eslint-disable-next-line import/no-default-export
export default mod

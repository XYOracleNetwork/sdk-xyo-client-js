import { EmptyObject } from '@xyo-network/core'
import { Argv, CommandBuilder, CommandModule } from 'yargs'

import { printError, printLine } from '../../../lib'
import { ModuleArguments } from '../ModuleArguments'
import { getArchivist } from './util'

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) => yargs.usage('Usage: $0 archivist discover')
export const command = 'discover'
export const deprecated = false
export const describe = 'Issue a Discover query against the XYO Archivist Module'
export const handler = async (argv: ModuleArguments) => {
  const { verbose } = argv
  try {
    const mod = await getArchivist(argv)
    const result = await mod.discover()
    printLine(JSON.stringify(result))
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Error Querying Archivist')
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

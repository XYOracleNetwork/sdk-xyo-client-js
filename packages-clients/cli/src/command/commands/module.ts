import { EmptyObject } from '@xyo-network/core'
import { parse } from 'path'
import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

import { printError, printLine } from '../../lib'
import { opts } from '../requireDirectoryOptions'
import { ModuleArguments } from './ModuleArguments'
import { getModuleFromArgs } from './util'

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs.usage('Usage: $0 module <query> <address> [Options]').commandDir(parse(__filename).name, opts)
export const command = 'module <address>'
export const deprecated = false
export const describe = 'Issue queries against an XYO Module'
export const handler = async (argv: ArgumentsCamelCase<ModuleArguments>) => {
  const { verbose } = argv
  try {
    const module = await getModuleFromArgs(argv)
    const result = module.describe() ?? {}
    printLine(JSON.stringify(result))
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Error querying for archivists')
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

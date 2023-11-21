import { EmptyObject } from '@xyo-network/core'
import { DivinerDivineQuerySchema, isDivinerInstance } from '@xyo-network/diviner-model'
import { parse } from 'path'
import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

import { printError, printLine } from '../../lib'
import { BaseArguments } from '../BaseArguments'
import { opts } from '../requireDirectoryOptions'
import { getNode } from '../util'

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs.usage('Usage: $0 diviner <query> <address> [Options]').commandDir(parse(__filename).name, opts)
export const command = 'diviner'
export const deprecated = false
export const describe = 'Issue queries against an XYO diviner'
export const handler = async (argv: ArgumentsCamelCase<BaseArguments>) => {
  const { verbose } = argv
  try {
    const node = await getNode(argv)
    const modules = await node.resolve({ query: [[DivinerDivineQuerySchema]] }, { direction: 'down', identity: isDivinerInstance })
    const descriptions = await Promise.all(modules.map((module) => module.describe()))
    printLine(JSON.stringify(descriptions))
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Error querying for diviners')
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

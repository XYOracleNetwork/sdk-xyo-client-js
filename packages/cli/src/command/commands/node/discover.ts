import { EmptyObject } from '@xyo-network/core'
import { parse } from 'path'
import { Argv, CommandBuilder, CommandModule } from 'yargs'

import { printError, printLine } from '../../../lib'
import { BaseArguments } from '../../BaseArguments'
import { opts } from '../../requireDirectoryOptions'
import { getNode } from '../../util'

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) => yargs.usage('Usage: $0 node discover [command]').commandDir(parse(__filename).name, opts)
export const command = 'discover'
export const deprecated = false
export const describe = 'Issue a discover query against the XYO Node'
export const handler = async (argv: BaseArguments) => {
  const { verbose } = argv
  try {
    const node = await getNode(argv)
    const result = await node.discover()
    printLine(JSON.stringify(result))
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Error querying for archivists')
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

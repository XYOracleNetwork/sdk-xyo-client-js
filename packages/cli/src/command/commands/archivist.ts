import { EmptyObject } from '@xyo-network/core'
import { ArchivistGetQuerySchema } from '@xyo-network/modules'
import { parse } from 'path'
import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

import { BaseArguments } from '../BaseArguments'
import { opts } from '../requireDirectoryOptions'
import { getNode } from '../util'

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs.usage('Usage: $0 archivist <query> <address> [Options]').commandDir(parse(__filename).name, opts).version(false)
export const command = 'archivist'
export const deprecated = false
export const describe = 'Issue queries against an XYO archivist'
export const handler = async (argv: ArgumentsCamelCase<BaseArguments>) => {
  const { verbose } = argv
  try {
    const node = await getNode(argv)
    const result = ((await node.description()) ?? {})?.children?.filter((mod) => mod.queries.includes(ArchivistGetQuerySchema))
    console.log(JSON.stringify(result))
  } catch (error) {
    if (verbose) console.error(error)
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

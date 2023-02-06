import { parse } from 'path'
import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

import { opts } from '../requireDirectoryOptions'
import { getModule } from './util'

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs.usage('Usage: $0 archivist <query> <address> [Options]').commandDir(parse(__filename).name, opts).demandCommand().version(false)
export const command = 'archivist'
export const deprecated = false
export const describe = 'Issue queries against an XYO archivist'
export const handler = async (argv: ArgumentsCamelCase<Arguments>) => {
  const { hashes, verbose } = argv
  try {
    const archivist = await getModule(argv)
    const result = await archivist.get(hashes)
    console.log(result)
  } catch (error) {
    if (verbose) console.error(error)
    throw new Error('Error querying archivist')
  }
}

const mod: CommandModule = {
  aliases,
  command,
  deprecated,
  describe,
  handler,
}

// eslint-disable-next-line import/no-default-export
export default mod

import { parse } from 'path'
import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

import { opts } from '../requireDirectoryOptions'

// eslint-disable-next-line @typescript-eslint/ban-types
type Arguments = {}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs
    .usage('Usage: $0 module <address> <module_type> <module_command> [Options]')
    .commandDir(parse(__filename).name, opts)
    .positional('address', { demandOption: true })
    .demandCommand()
    .version(false)
export const command = 'module <address>'
export const deprecated = false
export const describe = 'Issue queries against an XYO module'
export const handler = function (_argv: ArgumentsCamelCase<Arguments>) {
  // do something with argv.
  console.log('handler')
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

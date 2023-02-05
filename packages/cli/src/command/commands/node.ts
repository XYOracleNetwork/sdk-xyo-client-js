import { parse } from 'path'
import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

import { opts } from '../requireDirectoryOptions'

// eslint-disable-next-line @typescript-eslint/ban-types
type Arguments = {}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs.usage('Usage: $0 node <command> [Options]').commandDir(parse(__filename).name, opts).demandCommand().version(false)
export const command = 'node <command> [Options]'
export const deprecated = false
export const describe = 'Issue queries against XYO Node(s)'
export const handler = function (argv: ArgumentsCamelCase<Arguments>) {
  console.log(command)
  console.log(argv)
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

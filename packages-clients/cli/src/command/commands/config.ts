import { parse } from 'path'
import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

import { printLine } from '../../lib'
import { opts } from '../requireDirectoryOptions'

// eslint-disable-next-line @typescript-eslint/ban-types
type Arguments = {}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs.usage('Usage: $0 config <command> [Options]').commandDir(parse(__filename).name, opts).demandCommand()
export const command = 'config <command> [Options]'
export const deprecated = false
export const describe = 'Get and set CLI/Node config options'
export const handler = (argv: ArgumentsCamelCase<Arguments>) => {
  printLine(JSON.stringify(command))
  printLine(JSON.stringify(argv))
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

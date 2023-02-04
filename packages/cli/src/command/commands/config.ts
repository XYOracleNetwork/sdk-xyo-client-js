import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

import { opts } from '../requireDirectoryOptions'

// eslint-disable-next-line @typescript-eslint/ban-types
type Arguments = {}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs.usage('Usage: $0 config <command> [Options]').commandDir('./config', opts).demandCommand().version(false)
export const command = 'config <command> [Options]'
export const deprecated = false
export const describe = 'XYO config commands'
export const handler = (_argv: ArgumentsCamelCase<Arguments>) => {
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

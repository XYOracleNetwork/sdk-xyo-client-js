import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

// eslint-disable-next-line @typescript-eslint/ban-types
type Arguments = {}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs.usage('Usage: $0 node <command> [Options]').commandDir('./node').demandCommand().version(false)
export const command = 'node <command> [Options]'
export const deprecated = false
export const describe = 'XYO node lifecycle commands'
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

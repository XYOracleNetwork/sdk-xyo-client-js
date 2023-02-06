import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

// eslint-disable-next-line @typescript-eslint/ban-types
type Arguments = {}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs
    .usage('Usage: $0 archivist insert <address> <payloads..>')
    .positional('address', { demandOption: true, type: 'string' })
    .positional('payloads', { array: true, demandOption: true, type: 'string' })
    .version(false)

export const command = 'insert <address> <payloads..>'
export const deprecated = false
export const describe = 'Insert payload(s) into the Archivist'
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

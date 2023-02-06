import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

// eslint-disable-next-line @typescript-eslint/ban-types
type Arguments = {}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs
    .usage('Usage: $0 archivist find <address> <filter>')
    .positional('address', { demandOption: true, type: 'string' })
    .positional('filter', { demandOption: true, type: 'string' })
    .version(false)

export const command = 'find <address> <filter>'
export const deprecated = false
export const describe = 'Find payload(s) in the Archivist matching the supplied filter'
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

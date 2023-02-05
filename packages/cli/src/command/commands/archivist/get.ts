import { ArgumentsCamelCase, Argv, CommandBuilder, CommandModule } from 'yargs'

// eslint-disable-next-line @typescript-eslint/ban-types
type Arguments = {}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = (yargs: Argv) =>
  yargs
    .command('get', 'Get hash(es) from the Archivist', (yargs) => {
      yargs.positional('address', { demandOption: true, type: 'string' })
      yargs.positional('hashes', { array: true, demandOption: true, type: 'string' })
    })
    .usage('Usage: $0 archivist get <address> [hashes..]')
    .version(false)

export const command = 'get <address> [hashes..]'
export const deprecated = false
export const describe = 'Get hash(es) from the Archivist'
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

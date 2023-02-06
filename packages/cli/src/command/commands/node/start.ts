import { ArgumentsCamelCase, CommandBuilder, CommandModule } from 'yargs'

import { printLine } from '../../../lib'

// eslint-disable-next-line @typescript-eslint/ban-types
type Arguments = {}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = {
  banana: {
    default: 'cool',
  },
  batman: {
    default: 'sad',
  },
}
export const command = 'start'
export const deprecated = false
export const describe = 'Start the local XYO Node'
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

import { ArgumentsCamelCase, CommandBuilder } from 'yargs'

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
export const command = 'get <source> [proxy]'
export const deprecated = false
export const describe = 'make a get HTTP request'
export const handler = function (_argv: ArgumentsCamelCase<Arguments>) {
  // do something with argv.
  console.log('hhhhhhhhh')
}

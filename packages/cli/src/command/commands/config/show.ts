import { json } from 'stream/consumers'
import { ArgumentsCamelCase, CommandBuilder, CommandModule, Options } from 'yargs'

// eslint-disable-next-line @typescript-eslint/ban-types
type Arguments = {}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = {
  outFile: {
    description: 'The file path to output the config to',
    type: 'string',
  } as Options,
  output: {
    choices: ['json'], // TODO: YAML
    default: json,
  } as Options,
}
export const command = 'show'
export const deprecated = false
export const describe = 'display config'
export const handler = (_argv: ArgumentsCamelCase<Arguments>) => {
  // do something with argv.
  console.log(_argv)
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

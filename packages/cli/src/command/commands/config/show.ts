import { AbstractModuleConfig } from '@xyo-network/module'
import { ArgumentsCamelCase, CommandBuilder, CommandModule, Options } from 'yargs'

import { printLine, readFileDeep } from '../../../lib'

const showConfig = async () => {
  const [config, path] = readFileDeep(['xyo-config.json', 'xyo-config.js'])
  let configObj: AbstractModuleConfig | undefined
  if (config) {
    if (path?.endsWith('.json')) {
      configObj = JSON.parse(config) as AbstractModuleConfig
    } else if (path?.endsWith('.cjs') || path?.endsWith('.js')) {
      configObj = (await import(path)) as AbstractModuleConfig
    }
  }
  printLine(JSON.stringify(configObj ?? {}))
}

// eslint-disable-next-line @typescript-eslint/ban-types
type Arguments = {}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = {
  output: {
    choices: ['json'], // TODO: YAML
    default: 'json',
  } as Options,
}
export const command = 'show'
export const deprecated = false
export const describe = 'display config'
export const handler = (_argv: ArgumentsCamelCase<Arguments>) => showConfig()

const mod: CommandModule = {
  aliases,
  command,
  deprecated,
  describe,
  handler,
}

// eslint-disable-next-line import/no-default-export
export default mod

import { EmptyObject } from '@xyo-network/core'
import { AbstractModuleConfig, AbstractModuleConfigSchema } from '@xyo-network/module'
import { CommandBuilder, CommandModule } from 'yargs'

import { readFileDeep } from '../../../lib'
import { BaseArguments } from '../../BaseArguments'

const getConfig = async (): Promise<AbstractModuleConfig> => {
  const [config, path] = readFileDeep(['xyo-config.json', 'xyo-config.js'])
  let configObj: AbstractModuleConfig | undefined
  if (config) {
    if (path?.endsWith('.json')) {
      configObj = JSON.parse(config) as AbstractModuleConfig
    } else if (path?.endsWith('.cjs') || path?.endsWith('.js')) {
      configObj = (await import(path)) as AbstractModuleConfig
    }
  }
  return configObj ?? { schema: AbstractModuleConfigSchema }
}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = {}
export const command = 'show'
export const deprecated = false
export const describe = 'Display the current Node config'
export const handler = async (_argv: BaseArguments) => {
  const config = await getConfig()
}

const mod: CommandModule<EmptyObject, BaseArguments> = {
  aliases,
  command,
  deprecated,
  describe,
  handler,
}

// eslint-disable-next-line import/no-default-export
export default mod

import { EmptyObject } from '@xyo-network/core'
import { ModuleConfig, ModuleConfigSchema } from '@xyo-network/module'
import { CommandBuilder, CommandModule } from 'yargs'

import { readFileDeep } from '../../../lib'
import { BaseArguments } from '../../BaseArguments'
import { outputContext } from '../../util'

const getConfig = async (): Promise<ModuleConfig> => {
  const [config, path] = readFileDeep(['xyo-config.json', 'xyo-config.js'])
  let configObj: ModuleConfig | undefined
  if (config) {
    if (path?.endsWith('.json')) {
      configObj = JSON.parse(config) as ModuleConfig
    } else if (path?.endsWith('.cjs') || path?.endsWith('.js')) {
      configObj = (await import(path)) as ModuleConfig
    }
  }
  return configObj ?? { schema: ModuleConfigSchema }
}

export const aliases: ReadonlyArray<string> = []
export const builder: CommandBuilder = {}
export const command = 'show'
export const deprecated = false
export const describe = 'Display the current Node config'
export const handler = async (args: BaseArguments) => {
  await outputContext(args, async (log) => {
    const config = await getConfig()
    log(config)
  })
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

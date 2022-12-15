import { AbstractModuleConfig } from '@xyo-network/module'

import { printLine, printTitle, readFileDeep } from '../../../lib'

export const showConfig = async () => {
  const [config, path] = readFileDeep(['xyo-config.json', 'xyo-config.js'])
  let configObj: AbstractModuleConfig | undefined
  printTitle(`Config found at: ${path}`)
  if (config) {
    if (path?.endsWith('.json')) {
      configObj = JSON.parse(config) as AbstractModuleConfig
    } else if (path?.endsWith('.cjs') || path?.endsWith('.js')) {
      configObj = (await import(path)) as AbstractModuleConfig
    }
  }
  printLine(JSON.stringify(configObj ?? {}))
}

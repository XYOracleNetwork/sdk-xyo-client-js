import { ModuleConfig } from '@xyo-network/module-model'

import { printLine, printTitle, readFileDeep } from '../../../lib'

export const showConfig = async () => {
  const [config, path] = readFileDeep(['xyo-config.json', 'xyo-config.js'])
  let configObj: ModuleConfig | undefined
  printTitle(`Config found at: ${path}`)
  if (config) {
    if (path?.endsWith('.json')) {
      configObj = JSON.parse(config) as ModuleConfig
    } else if (path?.endsWith('.cjs') || path?.endsWith('.js')) {
      configObj = (await import(path)) as ModuleConfig
    }
  }
  printLine(JSON.stringify(configObj ?? {}))
}

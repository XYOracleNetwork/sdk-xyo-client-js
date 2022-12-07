import { XyoModuleConfig } from '@xyo-network/module'

import { printLine, printTitle, readFileDeep } from '../../lib'

export const showConfig = async () => {
  const [config, path] = readFileDeep(['xyo-config.json', 'xyo-config.js'])
  let configObj: XyoModuleConfig | undefined
  printTitle(`Config found at: ${path}`)
  if (config) {
    if (path?.endsWith('.json')) {
      configObj = JSON.parse(config) as XyoModuleConfig
    } else if (path?.endsWith('.cjs') || path?.endsWith('.js')) {
      configObj = (await import(path)) as XyoModuleConfig
    }
  }
  printLine(JSON.stringify(configObj ?? {}))
}

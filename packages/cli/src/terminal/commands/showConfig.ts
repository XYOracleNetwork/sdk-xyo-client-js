import { XyoModuleConfig } from '@xyo-network/module'
import { terminal } from 'terminal-kit'

import { newline, readFileDeep } from '../../lib'

export const showConfig = async () => {
  const [config, path] = readFileDeep(['xyo-config.json', 'xyo-config.js'])
  let configObj: XyoModuleConfig | undefined
  newline()
  terminal.yellow(`Config found at: ${path}`)
  newline()
  if (config) {
    if (path?.endsWith('.json')) {
      configObj = JSON.parse(config) as XyoModuleConfig
    } else if (path?.endsWith('.cjs') || path?.endsWith('.js')) {
      configObj = (await import(path)) as XyoModuleConfig
    }
  }
  terminal(JSON.stringify(configObj ?? {}))
  newline()
}

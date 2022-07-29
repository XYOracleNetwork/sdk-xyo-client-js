import { XyoValidator } from '@xyo-network/core'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoPayloadPlugin } from './Plugin'

export class XyoPayloadPluginResolver<T extends XyoPayloadPlugin<string> = XyoPayloadPlugin<string>> {
  protected pluginMap = new Map<string, T>()
  protected defaultPlugin: T

  constructor(plugins: T[], defaultPlugin: T) {
    plugins?.forEach((plugin) => this.pluginMap.set(plugin.schema, plugin))
    this.defaultPlugin = defaultPlugin
  }
  schema = 'network.xyo.payload'

  public register(plugin: T) {
    this.pluginMap.set(plugin.schema, plugin)
  }

  public resolve(schema?: string): T
  public resolve(payload: XyoPayload): T
  public resolve(value: XyoPayload | string | undefined): T {
    return value ? this.pluginMap.get(typeof value === 'string' ? value : value.schema) ?? this.defaultPlugin : this.defaultPlugin
  }

  public validate(payload: XyoPayload): XyoValidator<XyoPayload> {
    return this.resolve(payload).validate(payload)
  }

  public wrap(payload: XyoPayload): XyoPayloadWrapper<XyoPayload> {
    return this.resolve(payload).wrap(payload)
  }

  /** @description Create list of plugins, optionally filtered by ability to witness/divine */
  public plugins(type?: 'witness' | 'diviner') {
    const result: T[] = []
    this.pluginMap.forEach((value) => {
      if (type === 'witness' && !value.witness) {
        return
      }
      if (type === 'diviner' && !value.diviner) {
        return
      }
      result.push(value)
    })
    return result
  }

  /** @description Create list of schema, optionally filtered by ability to witness/divine */
  public schemas(type?: 'witness' | 'diviner') {
    const result: string[] = []
    this.pluginMap.forEach((value) => {
      if (type === 'witness' && !value.witness) {
        return
      }
      if (type === 'diviner' && !value.diviner) {
        return
      }
      result.push(value.schema)
    })
    return result
  }
}

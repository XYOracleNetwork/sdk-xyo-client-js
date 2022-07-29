import { XyoValidator } from '@xyo-network/core'
import { XyoPayload, XyoPayloadBase, XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoWitness } from '@xyo-network/witnesses'

import { XyoDefaultPayloadPlugin } from './Default'
import { XyoPayloadPlugin } from './Plugin'

export class XyoPayloadPluginResolver {
  protected plugins = new Map<string, XyoPayloadPlugin<string>>()
  protected defaultPlugin: XyoPayloadPlugin<string>

  constructor(plugins?: XyoPayloadPlugin<string>[], defaultPlugin = XyoDefaultPayloadPlugin) {
    plugins?.forEach((plugin) => this.plugins.set(plugin.schema, plugin))
    this.defaultPlugin = defaultPlugin
  }
  schema = 'network.xyo.payload'

  public register(plugin: XyoPayloadPlugin<string>) {
    this.plugins.set(plugin.schema, plugin)
  }

  public resolve(schema?: string): XyoPayloadPlugin<string>
  public resolve(payload: XyoPayload): XyoPayloadPlugin<string>
  public resolve(value: XyoPayload | string | undefined): XyoPayloadPlugin<string> {
    return value ? this.plugins.get(typeof value === 'string' ? value : value.schema) ?? this.defaultPlugin : this.defaultPlugin
  }

  public validate(payload: XyoPayloadBase): XyoValidator<XyoPayloadBase> {
    return this.resolve(payload).validate(payload)
  }

  public witness(schema?: string): XyoWitness<XyoPayloadBase> {
    return this.resolve(schema).witness()
  }

  public wrap(payload: XyoPayloadBase): XyoPayloadWrapper<XyoPayloadBase> {
    return this.resolve(payload).wrap(payload)
  }

  public list() {
    return this.plugins.forEach((value) => value.schema)
  }

  public default() {
    return this.defaultPlugin.schema
  }
}

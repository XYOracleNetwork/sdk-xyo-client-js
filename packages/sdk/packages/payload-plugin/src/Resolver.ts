import { Validator } from '@xyo-network/core'
import { XyoPayload, XyoPayloadSchema } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { createXyoPayloadPlugin } from './createPlugin'
import { XyoPayloadPlugin } from './Plugin'

export class XyoPayloadPluginResolver {
  schema = XyoPayloadSchema

  protected _plugins: Record<string, XyoPayloadPlugin> = {}
  protected defaultPlugin: XyoPayloadPlugin

  constructor(
    /** @param plugins The initial set of plugins */
    plugins?: XyoPayloadPlugin<XyoPayload>[],
    /** @param defaultPlugin Specifies the plugin to be used if no plugins resolve */
    defaultPlugin = createXyoPayloadPlugin<XyoPayload>({
      schema: XyoPayloadSchema,
    }),
  ) {
    plugins?.forEach((plugin) => this.register(plugin))
    this.defaultPlugin = defaultPlugin
  }

  /** @description Create list of plugins, optionally filtered by ability to witness/divine */
  plugins() {
    const result: XyoPayloadPlugin[] = []
    Object.values(this._plugins).forEach((value) => {
      result.push(value)
    })
    return result
  }

  register<TPlugin extends XyoPayloadPlugin = XyoPayloadPlugin>(plugin: TPlugin) {
    this._plugins[plugin.schema] = plugin

    return this
  }

  resolve(schema?: string): XyoPayloadPlugin
  resolve(payload: XyoPayload): XyoPayloadPlugin
  resolve(value: XyoPayload | string | undefined): XyoPayloadPlugin {
    return value ? this._plugins[typeof value === 'string' ? value : value.schema] ?? this.defaultPlugin : this.defaultPlugin
  }

  /** @description Create list of schema, optionally filtered by ability to witness/divine */
  schemas() {
    const result: string[] = []
    Object.values(this._plugins).forEach((value) => {
      result.push(value.schema)
    })
    return result
  }

  validate(payload: XyoPayload): Validator<XyoPayload> | undefined {
    return this.resolve(payload).validate?.(payload)
  }

  wrap(payload: XyoPayload): PayloadWrapper<XyoPayload> | undefined {
    return this.resolve(payload).wrap?.(payload)
  }
}

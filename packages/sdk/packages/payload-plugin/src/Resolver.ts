import { Validator } from '@xyo-network/core'
import { PayloadWrapper, XyoPayload, XyoPayloadSchema } from '@xyo-network/payload'

import { createXyoPayloadPlugin } from './createPlugin'
import { XyoPayloadPlugin } from './Plugin'
import { XyoPayloadPluginParams } from './XyoPayloadPluginConfigs'

export class XyoPayloadPluginResolver {
  public schema = XyoPayloadSchema

  protected _plugins: Record<string, XyoPayloadPlugin> = {}
  protected defaultPlugin: XyoPayloadPlugin
  protected params: Record<string, XyoPayloadPluginParams> = {}

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

  public async diviner(schema: string) {
    return await this._plugins[schema]?.diviner?.(this.params[schema]?.diviner)
  }

  /** @description Create list of plugins, optionally filtered by ability to witness/divine */
  public plugins(type?: 'witness' | 'diviner') {
    const result: XyoPayloadPlugin[] = []
    Object.values(this._plugins).forEach((value) => {
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

  public register<TPlugin extends XyoPayloadPlugin = XyoPayloadPlugin, TParams extends TPlugin['params'] = TPlugin['params']>(
    plugin: TPlugin,
    params?: TParams,
  ) {
    this._plugins[plugin.schema] = plugin
    this.params[plugin.schema] = params ?? {}
    return this
  }

  public resolve(schema?: string): XyoPayloadPlugin
  public resolve(payload: XyoPayload): XyoPayloadPlugin
  public resolve(value: XyoPayload | string | undefined): XyoPayloadPlugin {
    return value ? this._plugins[typeof value === 'string' ? value : value.schema] ?? this.defaultPlugin : this.defaultPlugin
  }

  /** @description Create list of schema, optionally filtered by ability to witness/divine */
  public schemas(type?: 'witness' | 'diviner') {
    const result: string[] = []
    Object.values(this._plugins).forEach((value) => {
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

  public validate(payload: XyoPayload): Validator<XyoPayload> | undefined {
    return this.resolve(payload).validate?.(payload)
  }

  public async witness(schema: string) {
    return await this._plugins[schema]?.witness?.(this.params[schema]?.witness)
  }

  public wrap(payload: XyoPayload): PayloadWrapper<XyoPayload> | undefined {
    return this.resolve(payload).wrap?.(payload)
  }
}

import { Validator } from '@xyo-network/object'
import { Payload, PayloadSchema } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { createPayloadPlugin } from './createPlugin'
import { PayloadPlugin } from './Plugin'

export class PayloadPluginResolver {
  schema = PayloadSchema

  protected _plugins: Record<string, PayloadPlugin> = {}
  protected defaultPlugin: PayloadPlugin

  constructor(
    /** @param plugins The initial set of plugins */
    plugins?: PayloadPlugin<Payload>[],
    /** @param defaultPlugin Specifies the plugin to be used if no plugins resolve */
    defaultPlugin = createPayloadPlugin<Payload>({
      schema: PayloadSchema,
    }),
  ) {
    for (const plugin of plugins ?? []) this.register(plugin)
    this.defaultPlugin = defaultPlugin
  }

  /** @description Create list of plugins, optionally filtered by ability to witness/divine */
  plugins() {
    const result: PayloadPlugin[] = []
    for (const value of Object.values(this._plugins)) {
      result.push(value)
    }
    return result
  }

  register<TPlugin extends PayloadPlugin = PayloadPlugin>(plugin: TPlugin) {
    this._plugins[plugin.schema] = plugin

    return this
  }

  resolve(schema?: string): PayloadPlugin
  resolve(payload: Payload): PayloadPlugin
  resolve(value: Payload | string | undefined): PayloadPlugin {
    return value ? this._plugins[typeof value === 'string' ? value : value.schema] ?? this.defaultPlugin : this.defaultPlugin
  }

  /** @description Create list of schema, optionally filtered by ability to witness/divine */
  schemas() {
    const result: string[] = []
    for (const value of Object.values(this._plugins)) {
      result.push(value.schema)
    }
    return result
  }

  validate(payload: Payload): Validator<Payload> | undefined {
    return this.resolve(payload).validate?.(payload)
  }

  wrap(payload: Payload): PayloadWrapper<Payload> | undefined {
    return this.resolve(payload).wrap?.(payload)
  }
}

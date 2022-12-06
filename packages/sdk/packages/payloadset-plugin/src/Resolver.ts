import { Validator } from '@xyo-network/core'
import { QueryBoundWitnessWrapper, XyoQueryBoundWitness } from '@xyo-network/module'

import { PayloadSetPluginParams } from './Configs'
import { isPayloadSetDivinerPlugin, isPayloadSetWitnessPlugin, PayloadSetPlugin } from './Plugin'

export class PayloadSetPluginResolver {
  protected _plugins: Record<string, PayloadSetPlugin> = {}
  protected params: Record<string, PayloadSetPluginParams> = {}

  constructor(
    /** @param plugins The initial set of plugins */
    plugins?: PayloadSetPlugin[],
  ) {
    plugins?.forEach((plugin) => this.register(plugin))
  }

  public async diviner(set: string) {
    return await isPayloadSetDivinerPlugin(this._plugins[set])?.diviner?.(this.params[set]?.diviner)
  }

  /** @description Create list of plugins */
  public plugins() {
    const result: PayloadSetPlugin[] = []
    Object.values(this._plugins).forEach((value) => {
      result.push(value)
    })
    return result
  }

  public register<TPlugin extends PayloadSetPlugin = PayloadSetPlugin, TParams extends TPlugin['params'] = TPlugin['params']>(
    plugin: TPlugin,
    params?: TParams,
  ) {
    this._plugins[plugin.set] = plugin
    this.params[plugin.set] = params ?? {}
    return this
  }

  public resolve(set?: string): PayloadSetPlugin | undefined {
    return set ? this._plugins[set] ?? undefined : undefined
  }

  public sets() {
    const result: string[] = []
    Object.values(this._plugins).forEach((value) => {
      result.push(value.set)
    })
    return result
  }

  public validate(boundwitness: XyoQueryBoundWitness): Validator<XyoQueryBoundWitness> | undefined {
    return this.resolve(boundwitness.resultSet)?.validate?.(boundwitness)
  }

  public async witness(set: string) {
    return await isPayloadSetWitnessPlugin(this._plugins[set])?.witness?.(this.params[set]?.diviner)
  }

  public wrap(boundwitness: XyoQueryBoundWitness): QueryBoundWitnessWrapper | undefined {
    return this.resolve(boundwitness.resultSet)?.wrap?.(boundwitness)
  }
}

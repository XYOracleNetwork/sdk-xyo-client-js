import { Hasher, Validator } from '@xyo-network/core'
import { DivinerParams } from '@xyo-network/diviner-model'
import { QueryBoundWitnessWrapper, XyoQueryBoundWitness } from '@xyo-network/module'
import { PayloadSetPayload } from '@xyo-network/payload-model'
import { WitnessModule, WitnessParams } from '@xyo-network/witness'

import { isPayloadSetDivinerPlugin, isPayloadSetWitnessPlugin, PayloadSetDivinerPlugin, PayloadSetPlugin, PayloadSetWitnessPlugin } from './Plugin'

export class PayloadSetPluginResolver {
  protected _plugins: Record<string, PayloadSetPlugin> = {}
  protected params: Record<string, PayloadSetPlugin['params'] | undefined> = {}

  constructor(
    /** @param plugins The initial set of plugins */
    plugins?: PayloadSetPlugin[],
  ) {
    plugins?.forEach((plugin) => this.register(plugin))
  }

  async diviner(set: string) {
    return await isPayloadSetDivinerPlugin(this._plugins[set])?.diviner?.(this.params[set] as DivinerParams)
  }

  diviners() {
    const result: PayloadSetDivinerPlugin[] = []
    Object.values(this._plugins).forEach((plugin) => {
      const diviner = isPayloadSetDivinerPlugin(plugin)
      if (diviner) {
        result.push(diviner)
      }
    })
    return result
  }

  plugins() {
    const result: PayloadSetPlugin[] = []
    Object.values(this._plugins).forEach((value) => {
      result.push(value)
    })
    return result
  }

  register(plugin: PayloadSetPlugin, params?: PayloadSetPlugin['params']) {
    const setHash = Hasher.hash(plugin.set)
    this._plugins[setHash] = plugin
    this.params[setHash] = params
    return this
  }

  resolve(set?: PayloadSetPayload): PayloadSetPlugin | undefined
  resolve(set?: string): PayloadSetPlugin | undefined
  resolve(set?: string | PayloadSetPayload): PayloadSetPlugin | undefined {
    const setHash = typeof set === 'string' ? set : set ? Hasher.hash(set) : undefined
    return setHash ? this._plugins[setHash] ?? undefined : undefined
  }

  sets() {
    const result: PayloadSetPayload[] = []
    Object.values(this._plugins).forEach((value) => {
      result.push(value.set)
    })
    return result
  }

  validate(boundwitness: XyoQueryBoundWitness): Validator<XyoQueryBoundWitness> | undefined {
    return this.resolve(boundwitness.resultSet)?.validate?.(boundwitness)
  }

  async witness(set: PayloadSetPayload): Promise<WitnessModule | undefined>
  async witness(set: string): Promise<WitnessModule | undefined>
  async witness(set: string | PayloadSetPayload): Promise<WitnessModule | undefined> {
    const setHash = typeof set === 'string' ? set : Hasher.hash(set)
    return await isPayloadSetWitnessPlugin(this._plugins[setHash])?.witness?.(this.params[setHash] as WitnessParams)
  }

  witnesses() {
    const result: PayloadSetWitnessPlugin[] = []
    Object.values(this._plugins).forEach((plugin) => {
      const witness = isPayloadSetWitnessPlugin(plugin)
      if (witness) {
        result.push(witness)
      }
    })
    return result
  }

  wrap(boundwitness: XyoQueryBoundWitness): QueryBoundWitnessWrapper | undefined {
    return this.resolve(boundwitness.resultSet)?.wrap?.(boundwitness)
  }
}

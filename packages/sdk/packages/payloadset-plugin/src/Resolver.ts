import { PayloadHasher, Validator } from '@xyo-network/core'
import { DivinerModule, DivinerParams } from '@xyo-network/diviner-model'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/module'
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins?.forEach((plugin) => this.register(plugin as any))
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

  async register<TModule extends WitnessModule | DivinerModule>(plugin: PayloadSetPlugin<TModule>, params?: TModule['params']) {
    const setHash = await PayloadHasher.hashAsync(plugin.set)
    this._plugins[setHash] = plugin
    this.params[setHash] = params
    return this
  }

  async resolve(set?: PayloadSetPayload): Promise<PayloadSetPlugin | undefined>
  async resolve(set?: string): Promise<PayloadSetPlugin | undefined>
  async resolve(set?: string | PayloadSetPayload): Promise<PayloadSetPlugin | undefined> {
    const setHash = typeof set === 'string' ? set : set ? await PayloadHasher.hashAsync(set) : undefined
    return setHash ? this._plugins[setHash] ?? undefined : undefined
  }

  sets() {
    const result: PayloadSetPayload[] = []
    Object.values(this._plugins).forEach((value) => {
      result.push(value.set)
    })
    return result
  }

  async validate(boundwitness: QueryBoundWitness): Promise<Validator<QueryBoundWitness> | undefined> {
    return (await this.resolve(boundwitness.resultSet))?.validate?.(boundwitness)
  }

  async witness(set: PayloadSetPayload): Promise<WitnessModule | undefined>
  async witness(set: string): Promise<WitnessModule | undefined>
  async witness(set: string | PayloadSetPayload): Promise<WitnessModule | undefined> {
    const setHash = typeof set === 'string' ? set : await PayloadHasher.hashAsync(set)
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

  async wrap(boundwitness: QueryBoundWitness): Promise<QueryBoundWitnessWrapper | undefined> {
    return (await this.resolve(boundwitness.resultSet))?.wrap?.(boundwitness)
  }
}

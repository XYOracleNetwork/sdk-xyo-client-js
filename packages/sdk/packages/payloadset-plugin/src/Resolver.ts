import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { DivinerModule, DivinerParams } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { Validator } from '@xyo-network/object'
import { PayloadSetPayload } from '@xyo-network/payload-model'
import { WitnessModule, WitnessParams } from '@xyo-network/witness-model'

import {
  isPayloadSetDivinerPlugin,
  isPayloadSetWitnessPlugin,
  PayloadSetDivinerPlugin,
  PayloadSetPlugin,
  PayloadSetWitnessPlugin,
  tryAsPayloadSetDivinerPlugin,
  tryAsPayloadSetWitnessPlugin,
} from './Plugin'

export class PayloadSetPluginResolver {
  protected _params: Record<string, PayloadSetPlugin['params'] | undefined> = {}
  protected _plugins: Record<string, PayloadSetPlugin> = {}

  constructor(
    /** @param plugins The initial set of plugins */
    plugins?: PayloadSetPlugin[],
  ) {
    for (const plugin of plugins ?? []) this.register(plugin)
  }

  async diviner(set: PayloadSetPayload): Promise<DivinerModule | undefined>
  async diviner(set: string): Promise<DivinerModule | undefined>
  async diviner(set: string | PayloadSetPayload): Promise<DivinerModule | undefined> {
    const setHash = typeof set === 'string' ? set : await PayloadHasher.hashAsync(set)
    return await tryAsPayloadSetDivinerPlugin(this._plugins[setHash])?.diviner?.(this._params[setHash] as DivinerParams)
  }

  diviners(): PayloadSetDivinerPlugin[] {
    return Object.values(this._plugins).filter(isPayloadSetDivinerPlugin)
  }

  params(): (PayloadSetPlugin['params'] | undefined)[] {
    return Object.values(this._params)
  }

  plugins(): PayloadSetPlugin[] {
    return Object.values(this._plugins)
  }

  async register<TModule extends WitnessModule | DivinerModule>(plugin: PayloadSetPlugin<TModule>, params?: TModule['params']) {
    const setHash = await PayloadHasher.hashAsync(plugin.set)
    this._plugins[setHash] = plugin
    this._params[setHash] = params
    return this
  }

  async resolve(set?: PayloadSetPayload): Promise<PayloadSetPlugin | undefined>
  async resolve(set?: string): Promise<PayloadSetPlugin | undefined>
  async resolve(set?: string | PayloadSetPayload): Promise<PayloadSetPlugin | undefined> {
    const setHash = typeof set === 'string' ? set : set ? await PayloadHasher.hashAsync(set) : undefined
    return setHash ? this._plugins[setHash] : undefined
  }

  sets(): PayloadSetPayload[] {
    return Object.values(this._plugins).map((value) => value.set)
  }

  async validate(boundwitness: QueryBoundWitness): Promise<Validator<QueryBoundWitness> | undefined> {
    const resultSet = await this.resolve(boundwitness.resultSet)
    return resultSet?.validate?.(boundwitness)
  }

  async witness(set: PayloadSetPayload): Promise<WitnessModule | undefined>
  async witness(set: string): Promise<WitnessModule | undefined>
  async witness(set: string | PayloadSetPayload): Promise<WitnessModule | undefined> {
    const setHash = typeof set === 'string' ? set : await PayloadHasher.hashAsync(set)
    return await tryAsPayloadSetWitnessPlugin(this._plugins[setHash])?.witness?.(this._params[setHash] as WitnessParams)
  }

  witnesses(): PayloadSetWitnessPlugin[] {
    return Object.values(this._plugins).filter(isPayloadSetWitnessPlugin)
  }

  async wrap(boundwitness: QueryBoundWitness): Promise<QueryBoundWitnessWrapper | undefined> {
    const resultSet = await this.resolve(boundwitness.resultSet)
    return resultSet?.wrap?.(boundwitness)
  }
}

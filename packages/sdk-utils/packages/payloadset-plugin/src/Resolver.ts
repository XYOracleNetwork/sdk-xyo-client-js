import { forget } from '@xylabs/forget'
import type { DivinerModule, DivinerParams } from '@xyo-network/diviner-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { PayloadSetPayload } from '@xyo-network/payload-model'
import type { WitnessModule, WitnessParams } from '@xyo-network/witness-model'

import type {
  PayloadSetDivinerPlugin,
  PayloadSetPlugin,
  PayloadSetWitnessPlugin,
} from './Plugin.ts'
import {
  isPayloadSetDivinerPlugin,
  isPayloadSetWitnessPlugin,
  tryAsPayloadSetDivinerPlugin,
  tryAsPayloadSetWitnessPlugin,
} from './Plugin.ts'

export class PayloadSetPluginResolver {
  protected _params: Record<string, PayloadSetPlugin['params'] | undefined> = {}
  protected _plugins: Record<string, PayloadSetPlugin> = {}

  constructor(
    /** @param plugins The initial set of plugins */
    plugins?: PayloadSetPlugin[],
  ) {
    for (const plugin of plugins ?? []) forget(this.register(plugin))
  }

  async diviner(set: PayloadSetPayload): Promise<DivinerModule | undefined>
  async diviner(set: string): Promise<DivinerModule | undefined>
  async diviner(set: string | PayloadSetPayload): Promise<DivinerModule | undefined> {
    const setHash = typeof set === 'string' ? set : await PayloadBuilder.dataHash(set)
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
    const setHash = await PayloadBuilder.dataHash(plugin.set)
    this._plugins[setHash] = plugin
    this._params[setHash] = params
    return this
  }

  async resolve(set?: PayloadSetPayload): Promise<PayloadSetPlugin | undefined>
  async resolve(set?: string): Promise<PayloadSetPlugin | undefined>
  async resolve(set?: string | PayloadSetPayload): Promise<PayloadSetPlugin | undefined> {
    const setHash
      = typeof set === 'string'
        ? set
        : set
          ? await PayloadBuilder.dataHash(set)
          : undefined
    return setHash ? this._plugins[setHash] : undefined
  }

  sets(): PayloadSetPayload[] {
    return Object.values(this._plugins).map(value => value.set)
  }

  async witness(set: PayloadSetPayload): Promise<WitnessModule | undefined>
  async witness(set: string): Promise<WitnessModule | undefined>
  async witness(set: string | PayloadSetPayload): Promise<WitnessModule | undefined> {
    const setHash = typeof set === 'string' ? set : await PayloadBuilder.dataHash(set)
    return await tryAsPayloadSetWitnessPlugin(this._plugins[setHash])?.witness?.(this._params[setHash] as WitnessParams)
  }

  witnesses(): PayloadSetWitnessPlugin[] {
    return Object.values(this._plugins).filter(isPayloadSetWitnessPlugin)
  }
}

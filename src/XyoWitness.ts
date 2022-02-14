import merge from 'lodash/merge'

import { XyoPayload } from './models'
import { XyoHasher } from './XyoHasher'

export interface XyoWitnessConfig<T extends XyoPayload> {
  create: () => T
  observer?: (previousHash?: string) => T
}

export class XyoWitness<T extends XyoPayload, C extends XyoWitnessConfig<T> = XyoWitnessConfig<T>> {
  public config: C
  public previousHash?: string
  constructor(config: C) {
    this.config = config
  }

  public observe(payload?: Partial<T>): Promise<T> | T {
    const target = this.config.create()
    merge(target, { ...this.config.observer?.(this.previousHash), ...payload })
    const hasher = new XyoHasher(target)
    target._hash = hasher.sortedHash()
    this.previousHash = target._hash
    return target
  }
}

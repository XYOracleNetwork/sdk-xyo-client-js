import { XyoPayload } from './models'

export interface XyoWitnessConfig<T> {
  observer: (previousHash?: string) => T
}

export class XyoWitness<T extends XyoPayload> {
  public config: XyoWitnessConfig<T>
  public previousHash?: string
  constructor(config: XyoWitnessConfig<T>) {
    this.config = config
  }

  public observe() {
    const payload = this.config.observer(this.previousHash)
    this.previousHash = payload._hash
    return payload
  }
}

import { XyoPayload } from '../models'

export abstract class XyoWitness<T extends XyoPayload = XyoPayload> {
  abstract observe(fields?: Partial<T>): Promise<T>
  abstract get targetSchema(): string
}

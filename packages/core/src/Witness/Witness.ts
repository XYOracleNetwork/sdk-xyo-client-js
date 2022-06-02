import { XyoPayload } from '../Payload'

export abstract class XyoWitness<T extends XyoPayload = XyoPayload> {
  abstract observe(fields?: Partial<T>): Promise<T>
}

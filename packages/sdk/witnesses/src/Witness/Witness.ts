import { XyoPayload } from '@xyo-network/payload'

export interface XyoWitness<T extends XyoPayload = XyoPayload> {
  targetSchema: string
  observe(fields?: Partial<T>): Promise<T>
}

export abstract class XyoWitnessBase<T extends XyoPayload = XyoPayload> implements XyoWitness<T> {
  abstract observe(fields?: Partial<T>): Promise<T>
  abstract get targetSchema(): string
}

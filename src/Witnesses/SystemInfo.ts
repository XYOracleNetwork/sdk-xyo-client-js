import { XyoPayload } from '..'
import { XyoWitness } from '../XyoWitness'

export interface XyoSystemInfoPayload extends XyoPayload {
  device: string
  network: string
  os: string
}

export class XyoSystemInfoWitness extends XyoWitness<XyoSystemInfoPayload> {}

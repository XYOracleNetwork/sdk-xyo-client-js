import { XyoBoundWitness, XyoBoundWitnessWithPartialMeta } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWithPartialMeta } from '@xyo-network/payload'

import { Archivist } from './Model'
import { XyoPayloadFindFilter } from './Payload'

export abstract class XyoArchivist<TWrite extends XyoBoundWitness = XyoBoundWitnessWithPartialMeta, TRead extends XyoPayload = XyoPayloadWithPartialMeta>
  implements Archivist<string[], TWrite, TRead | undefined, string, TRead[], XyoPayloadFindFilter>
{
  abstract insert(item: TWrite): string[] | Promise<string[]>
  abstract find(query: XyoPayloadFindFilter): TRead[] | Promise<TRead[]>
  abstract get(hash: string): TRead | Promise<TRead | undefined> | undefined
  public delete(_hash: string): boolean {
    throw Error('delete not supported')
  }
  public clear() {
    throw Error('clear not supported')
  }
}

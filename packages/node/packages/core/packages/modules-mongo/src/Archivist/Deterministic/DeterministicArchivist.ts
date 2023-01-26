import { AbstractArchivist } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { PromisableArray } from '@xyo-network/promise'

export class DeterministicArchivist extends AbstractArchivist {
  get(hashes: string[]): PromisableArray<XyoPayload> {
    throw new Error('Method not implemented.')
  }
  insert(item: XyoPayload[]): PromisableArray<XyoBoundWitness> {
    throw new Error('Method not implemented.')
  }
}

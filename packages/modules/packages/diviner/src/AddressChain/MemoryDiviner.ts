import { assertEx } from '@xylabs/assert'
import { ArchivistGetQuerySchema } from '@xyo-network/archivist'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

import { AbstractDiviner, DivinerParams } from '../AbstractDiviner'
import { AddressChainDivinerConfig, AddressChainDivinerConfigSchema } from './Config'
import { AddressChainDiviner } from './Diviner'

// This diviner returns the most recent boundwitness signed by the address that can be found
// if multiple broken chains are found, all the heads are returned

export class MemoryAddressChainDiviner extends AbstractDiviner<DivinerParams<AddressChainDivinerConfig>> implements AddressChainDiviner {
  static override configSchema = AddressChainDivinerConfigSchema

  static override async create(params?: Partial<ModuleParams<AddressChainDivinerConfig>>): Promise<MemoryAddressChainDiviner> {
    return (await super.create(params)) as MemoryAddressChainDiviner
  }

  async divine(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    const result: XyoPayload[] = []
    assertEx(!payloads?.length, 'MemoryAddressChainDiviner.divine does not allow payloads to be sent')
    const archivists = (await this.resolve({ query: [[ArchivistGetQuerySchema]] }))?.map((archivist) => new ArchivistWrapper(archivist)) ?? []
    let currentHash: string | null = this.config.startHash
    while (currentHash && result.length < (this.config.maxResults ?? 1000)) {
      const bwPayload: XyoBoundWitness | undefined = await this.archivistFindHash(archivists, currentHash)
      const bw: BoundWitnessWrapper | undefined = BoundWitnessWrapper.parse(bwPayload)
      if (bw) {
        result.push(bw)
        currentHash = bw.prev(this.config.address)
      }
    }
    return result
  }

  private async archivistFindHash(archivists: ArchivistWrapper[], hash: string): Promise<XyoBoundWitness | undefined> {
    let index = 0
    if (archivists[index]) {
      const result = (await archivists[index].get([hash])).pop() as XyoBoundWitness
      if (result) {
        return result
      }
      index++
    }
  }
}

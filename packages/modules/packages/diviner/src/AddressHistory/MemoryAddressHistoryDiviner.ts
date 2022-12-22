import { assertEx } from '@xylabs/assert'
import { ArchivistGetQuerySchema, ArchivistWrapper } from '@xyo-network/archivist'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { XyoPayload } from '@xyo-network/payload-model'

import { AbstractDiviner } from '../AbstractDiviner'
import { AddressHistoryDiviner, AddressHistoryQueryPayload, isAddressHistoryQueryPayload } from './AddressHistoryDiviner'

export class MemoryAddressHistoryDiviner extends AbstractDiviner implements AddressHistoryDiviner {
  async divine(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    const query = payloads?.find<AddressHistoryQueryPayload>(isAddressHistoryQueryPayload)
    // TODO: Support multiple queries
    if (!query) return []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { address } = query
    const assertedAddress = assertEx(address)

    //only supporting single address at this point
    const singleAddress = assertEx((Array.isArray(assertedAddress) ? assertedAddress : [assertedAddress]).shift())

    const archivists =
      (await this.resolver?.resolve({ query: [[ArchivistGetQuerySchema]] }))?.map((archivist) => new ArchivistWrapper(archivist)) ?? []
    const bwLists = (
      await Promise.all(
        archivists.map((archivist) => {
          return archivist.find({ limit: 10000, schema: XyoBoundWitnessSchema }) as Promise<XyoBoundWitness[]>
        }),
      )
    ).flat()
    const bwRecords: Record<string, BoundWitnessWrapper[]> = {}
    bwLists
      .filter((bw) => bw.addresses.includes(singleAddress))
      .reduce((bwRecords, bw) => {
        const wrapper = new BoundWitnessWrapper(bw)
        bwRecords[wrapper.hash] = [wrapper]
        return bwRecords
      }, bwRecords)

    return Object.values(this.buildAddressLists(singleAddress, bwRecords)).flat()
  }

  private buildAddressLists(address: string, bwRecords: Record<string, BoundWitnessWrapper[]>): Record<string, BoundWitnessWrapper[]> {
    Object.entries(bwRecords).forEach(([hash, bw]) => {
      const single = bw[0]
      const prev = single.prev(address)
      if (prev) {
        if (bwRecords[prev]) {
          bwRecords[prev].unshift(single)
          delete bwRecords[hash]
        }
      }
    })
    return bwRecords
  }
}

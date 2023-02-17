import { assertEx } from '@xylabs/assert'
import { ArchivistGetQuerySchema } from '@xyo-network/archivist'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { DivinerConfig } from '@xyo-network/diviner-model'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

import { AbstractDiviner } from '../AbstractDiviner'
import { AddressHistoryDiviner } from './AddressHistoryDiviner'

export type MemoryAddressHistoryDivinerConfigSchema = 'network.xyo.diviner.address.history.memory.config'
export const MemoryAddressHistoryDivinerConfigSchema = 'network.xyo.diviner.address.history.memory.config'

export type MemoryAddressHistoryDivinerConfig = DivinerConfig<
  XyoBoundWitness,
  {
    address: string
    schema: MemoryAddressHistoryDivinerConfigSchema
  }
>

// This diviner returns the most recent boundwitness signed by the address that can be found
// if multiple broken chains are found, all the heads are returned

export class MemoryAddressHistoryDiviner extends AbstractDiviner<MemoryAddressHistoryDivinerConfig> implements AddressHistoryDiviner {
  static override configSchema = MemoryAddressHistoryDivinerConfigSchema

  static override async create(params?: Partial<ModuleParams<MemoryAddressHistoryDivinerConfig>>): Promise<MemoryAddressHistoryDiviner> {
    return (await super.create(params)) as MemoryAddressHistoryDiviner
  }

  async divine(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    assertEx(!payloads, 'MemoryAddressHistoryDiviner.divine does not allow payloads to be sent')
    const archivists =
      (await this.resolver?.resolve({ query: [[ArchivistGetQuerySchema]] }))?.map((archivist) => new ArchivistWrapper(archivist)) ?? []
    const bwLists = (
      await Promise.all(
        archivists.map((archivist) => {
          //Todo: add address to filter
          return archivist.find<XyoBoundWitness>({ limit: 10000, schema: XyoBoundWitnessSchema })
        }),
      )
    ).flat()

    const bwRecords = this.buildWrapperRecords(bwLists)

    const chains = Object.values(this.buildAddressChains(this.config.address, bwRecords))

    //return the heads of each chain (get the last bw on each chain)
    return chains.map((chain) => assertEx(chain.pop()))
  }

  private buildAddressChains(address: string, bwRecords: Record<string, BoundWitnessWrapper>): Record<string, BoundWitnessWrapper[]> {
    const arrayedResult = Object.entries(bwRecords).reduce<Record<string, BoundWitnessWrapper[]>>((prev, [key, value]) => {
      prev[key] = [value]
      return prev
    }, {})
    return Object.entries(bwRecords).reduce<Record<string, BoundWitnessWrapper[]>>((prev, [key, value]) => {
      //check if key is still there (may have been deleted as prevHash)
      if (prev[key]) {
        const previousHash = value.prev(address)
        if (previousHash) {
          //if we have the previousHash, move this bw to its chain
          if (prev[previousHash]) {
            prev[key].push(...prev[previousHash])
            delete prev[previousHash]
          }
        }
      }
      return prev
    }, arrayedResult)
  }

  //build object with hashes as keys and wrappers as values
  private buildWrapperRecords(lists: XyoBoundWitness[]) {
    return lists
      .filter((bw) => bw.addresses.includes(this.config.address))
      .reduce<Record<string, BoundWitnessWrapper>>((bwRecords, bw) => {
        const wrapper = new BoundWitnessWrapper(bw)
        bwRecords[wrapper.hash] = wrapper
        return bwRecords
      }, {})
  }
}

import { assertEx } from '@xylabs/assert'
import { ArchivistGetQuerySchema } from '@xyo-network/archivist'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { AbstractDiviner } from '../AbstractDiviner'
import { AddressHistoryDivinerConfig, AddressHistoryDivinerConfigSchema } from './Config'
import { AddressHistoryDiviner } from './Diviner'

// This diviner returns the most recent boundwitness signed by the address that can be found
// if multiple broken chains are found, all the heads are returned

export type MemoryAddressHistoryDivinerParams = DivinerParams<AnyConfigSchema<AddressHistoryDivinerConfig>>

export class MemoryAddressHistoryDiviner<TParams extends MemoryAddressHistoryDivinerParams>
  extends AbstractDiviner<TParams>
  implements AddressHistoryDiviner
{
  static override configSchema: string = AddressHistoryDivinerConfigSchema

  get queryAddress() {
    return assertEx(this.config.address, 'Missing address')
  }

  async divine(payloads?: Payload[]): Promise<Payload[]> {
    assertEx(!payloads?.length, 'MemoryAddressHistoryDiviner.divine does not allow payloads to be sent')
    const archivists =
      (await this.resolve({ query: [[ArchivistGetQuerySchema]] }))?.map(
        (archivist) => new ArchivistWrapper({ account: this.account, module: archivist }),
      ) ?? []
    assertEx(archivists.length > 0, 'Did not find any archivists')
    const bwLists = (
      await Promise.all(
        archivists.map(async (archivist) => {
          const all = await archivist.all()
          return all.filter((payload) => payload.schema === XyoBoundWitnessSchema) as XyoBoundWitness[]
        }),
      )
    ).flat()

    const bwRecords = this.buildWrapperRecords(bwLists)

    const chains = Object.values(this.buildAddressChains(this.queryAddress, bwRecords))

    //return the heads of each chain (get the last bw on each chain)
    return chains.map((chain) => assertEx(PayloadWrapper.unwrap(chain.shift())))
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
      .filter((bw) => bw.addresses.includes(this.queryAddress))
      .reduce<Record<string, BoundWitnessWrapper>>((bwRecords, bw) => {
        const wrapper = new BoundWitnessWrapper(bw)
        bwRecords[wrapper.hash] = wrapper
        return bwRecords
      }, {})
  }
}

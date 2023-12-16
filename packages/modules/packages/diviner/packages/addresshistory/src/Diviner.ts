import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { ArchivistGetQuerySchema, asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AddressHistoryDivinerConfigSchema, AddressHistoryDivinerParams } from '@xyo-network/diviner-address-history-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

// This diviner returns the most recent boundwitness signed by the address that can be found
// if multiple broken chains are found, all the heads are returned

export class AddressHistoryDiviner<TParams extends AddressHistoryDivinerParams = AddressHistoryDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [AddressHistoryDivinerConfigSchema]

  get queryAddress() {
    return assertEx(this.config.address, 'Missing address')
  }

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    assertEx(!payloads?.length, 'MemoryAddressHistoryDiviner.divine does not allow payloads to be sent')
    const archivists =
      (await Promise.all(await this.resolve({ query: [[ArchivistGetQuerySchema]] }))).map((module) =>
        asArchivistInstance(module, `Failed to cast module to Archivist [${module.config.name}]`),
      ) ?? []
    assertEx(archivists.length > 0, 'Did not find any archivists')
    const bwLists = (
      await Promise.all(
        archivists.map(async (archivist) => {
          const all = await archivist.all?.()
          return all?.filter((payload) => payload.schema === BoundWitnessSchema) as BoundWitness[]
        }),
      )
    ).flat()
    const bwRecords = await BoundWitnessWrapper.wrappedMap(bwLists)
    const chains = Object.values(this.buildAddressChains(this.queryAddress, bwRecords))

    // Return the heads of each chain (get the last bw on each chain)
    return chains.map((chain) => assertEx(PayloadWrapper.unwrap(chain.shift())))
  }

  private buildAddressChains(address: string, bwRecords: Record<string, BoundWitnessWrapper>): Record<string, BoundWitnessWrapper[]> {
    // eslint-disable-next-line unicorn/no-array-reduce
    const arrayedResult = Object.entries(bwRecords).reduce<Record<string, BoundWitnessWrapper[]>>((prev, [key, value]) => {
      prev[key] = [value]
      return prev
    }, {})
    // eslint-disable-next-line unicorn/no-array-reduce
    return Object.entries(bwRecords).reduce<Record<string, BoundWitnessWrapper[]>>((prev, [key, value]) => {
      //check if key is still there (may have been deleted as prevHash)
      if (prev[key]) {
        const previousHash = value.prev(address)
        if (
          previousHash && //if we have the previousHash, move this bw to its chain
          prev[previousHash]
        ) {
          prev[key].push(...prev[previousHash])
          delete prev[previousHash]
        }
      }
      return prev
    }, arrayedResult)
  }
}

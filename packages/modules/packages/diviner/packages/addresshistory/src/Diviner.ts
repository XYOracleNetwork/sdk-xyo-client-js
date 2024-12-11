import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import type { Address } from '@xylabs/hex'
import { ArchivistGetQuerySchema, asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { isBoundWitness, isBoundWitnessWithStorageMeta } from '@xyo-network/boundwitness-model'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type { AddressHistoryDivinerParams } from '@xyo-network/diviner-address-history-model'
import { AddressHistoryDivinerConfigSchema } from '@xyo-network/diviner-address-history-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, Schema } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

// This diviner returns the most recent boundwitness signed by the address that can be found
// if multiple broken chains are found, all the heads are returned

export class AddressHistoryDiviner<TParams extends AddressHistoryDivinerParams = AddressHistoryDivinerParams> extends AbstractDiviner<TParams> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, AddressHistoryDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = AddressHistoryDivinerConfigSchema

  get queryAddress() {
    return assertEx(this.config.address, () => 'Missing address')
  }

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    assertEx(!payloads?.length, () => 'MemoryAddressHistoryDiviner.divine does not allow payloads to be sent')

    const allBoundWitnesses = await this.allBoundWitnesses()
    const bwRecords = await PayloadBuilder.toDataHashMap(allBoundWitnesses)
    const chains = Object.values(this.buildAddressChains(this.queryAddress, bwRecords))

    // Return the heads of each chain (get the last bw on each chain)
    return chains.map(chain => assertEx(PayloadWrapper.unwrap(chain.shift())))
  }

  private async allBoundWitnesses() {
    const archivists
      = (await Promise.all(await this.resolve({ query: [[ArchivistGetQuerySchema]] }))).map(mod =>
        asArchivistInstance(mod, `Failed to cast module to Archivist [${mod.id}]`)) ?? []
    assertEx(archivists.length > 0, () => 'Did not find any archivists')
    return (
      await Promise.all(
        archivists.map(async (archivist) => {
          const all = await archivist.all?.()
          return all?.filter(isBoundWitnessWithStorageMeta)
        }),
      )
    )
      .flat()
      .filter(exists)
  }

  private buildAddressChains(address: Address, bwRecords: Record<string, BoundWitness>): Record<string, BoundWitness[]> {
    // eslint-disable-next-line unicorn/no-array-reduce
    const arrayedResult = Object.entries(bwRecords).reduce<Record<string, BoundWitness[]>>((prev, [key, value]) => {
      prev[key] = [value]
      return prev
    }, {})
    // eslint-disable-next-line unicorn/no-array-reduce
    return Object.entries(bwRecords).reduce<Record<string, BoundWitness[]>>((prev, [key, value]) => {
      // check if key is still there (may have been deleted as prevHash)
      if (prev[key]) {
        const previousHash = BoundWitnessBuilder.previousHash(value, address)
        if (
          previousHash // if we have the previousHash, move this bw to its chain
          && prev[previousHash]
        ) {
          prev[key].push(...prev[previousHash])
          delete prev[previousHash]
        }
      }
      return prev
    }, arrayedResult)
  }
}

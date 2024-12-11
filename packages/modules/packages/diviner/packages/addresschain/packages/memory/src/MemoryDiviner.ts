import { assertEx } from '@xylabs/assert'
import type { Hash } from '@xylabs/hex'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { isBoundWitnessWithStorageMeta } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AddressChainDiviner } from '@xyo-network/diviner-address-chain-abstract'
import type { AddressChainDivinerConfig } from '@xyo-network/diviner-address-chain-model'
import { AddressChainDivinerConfigSchema } from '@xyo-network/diviner-address-chain-model'
import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'
import type { Payload, Schema } from '@xyo-network/payload-model'

// This diviner returns the most recent boundwitness signed by the address that can be found
// if multiple broken chains are found, all the heads are returned
export type MemoryAddressChainDivinerParams = DivinerParams<AnyConfigSchema<AddressChainDivinerConfig>>

export class MemoryAddressChainDiviner<
  TParams extends MemoryAddressChainDivinerParams = MemoryAddressChainDivinerParams,
> extends AddressChainDiviner<TParams> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, AddressChainDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = AddressChainDivinerConfigSchema

  get queryAddress() {
    return assertEx(this.config.address, () => 'Missing address')
  }

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const result: Payload[] = []
    assertEx(!payloads?.length, () => 'MemoryAddressChainDiviner.divine does not allow payloads to be sent')
    try {
      const archivistIn = await this.archivistInstance()
      const archivist = assertEx(archivistIn, () => 'Unable to resolve archivist')
      let currentHash: Hash | null = assertEx(this.config.startHash, () => 'Missing startHash')
      while (currentHash && result.length < (this.config.maxResults ?? 1000)) {
        console.log(`currentHash: ${currentHash}`)
        const bwPayload: BoundWitness | undefined = await this.archivistFindHash([archivist], currentHash)
        const bwWrapper: BoundWitnessWrapper | undefined = BoundWitnessWrapper.tryParse(bwPayload)
        if (bwWrapper) {
          result.push(bwWrapper.payload)
          currentHash = bwWrapper.prev(this.queryAddress)
        } else {
          // was not a bound witness - bail
          console.log(`Hash is not a BoundWitness [${currentHash}]`)
          currentHash = null
        }
      }
    } catch (ex) {
      console.log(ex)
    }
    return result
  }

  private async archivistFindHash(archivists: ArchivistInstance[], hash: Hash): Promise<BoundWitness | undefined> {
    console.log('archivistFindHash')
    let index = 0
    if (archivists[index]) {
      const result = (await archivists[index].get([hash])).findLast(isBoundWitnessWithStorageMeta)
      if (result) {
        return result
      }
      index++
    }
  }
}

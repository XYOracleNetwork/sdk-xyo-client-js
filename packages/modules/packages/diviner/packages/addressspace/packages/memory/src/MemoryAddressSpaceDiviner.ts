import type { Address } from '@xylabs/sdk-js'
import { assertEx } from '@xylabs/sdk-js'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { AddressSpaceDiviner } from '@xyo-network/diviner-address-space-abstract'
import type { AddressSpaceDivinerParams } from '@xyo-network/diviner-address-space-model'
import { AddressSpaceDivinerConfigSchema } from '@xyo-network/diviner-address-space-model'
import type { AddressPayload } from '@xyo-network/module-model'
import { AddressSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  isStorageMeta, type Payload, type Schema,
} from '@xyo-network/payload-model'

/**
 * This Diviner returns the list of all addresses encountered for the reachable archivists
 */
export class MemoryAddressSpaceDiviner<TParams extends AddressSpaceDivinerParams = AddressSpaceDivinerParams> extends AddressSpaceDiviner<
  TParams,
  Payload,
  AddressPayload
> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, AddressSpaceDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = AddressSpaceDivinerConfigSchema

  protected override async divineHandler(payloads: Payload[] = []) {
    assertEx(payloads.length === 0, () => 'MemoryAddressSpaceDiviner.divine does not allow payloads to be sent')
    const archivistMod = assertEx(await this.archivistInstance(), () => 'Unable to resolve archivist')
    const archivist = ArchivistWrapper.wrap(archivistMod, this.account)
    const all = await archivist.next?.({ limit: Number.MAX_SAFE_INTEGER })
    const bwLists = all?.filter(x => isBoundWitness(x) && isStorageMeta(x)) ?? []
    const addresses = new Set<Address>(bwLists.flatMap(bw => bw.addresses).map(address => address.toLowerCase() as Address))
    return await Promise.all(
      [...addresses].map(address => new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()),
    )
  }
}

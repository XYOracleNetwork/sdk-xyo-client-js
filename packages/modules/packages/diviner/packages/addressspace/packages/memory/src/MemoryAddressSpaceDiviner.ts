import { assertEx } from '@xylabs/assert'
import type { Address } from '@xylabs/hex'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { isBoundWitnessWithStorageMeta } from '@xyo-network/boundwitness-model'
import { AddressSpaceDiviner } from '@xyo-network/diviner-address-space-abstract'
import type { AddressSpaceDivinerParams } from '@xyo-network/diviner-address-space-model'
import { AddressSpaceDivinerConfigSchema } from '@xyo-network/diviner-address-space-model'
import type { AddressPayload } from '@xyo-network/module-model'
import { AddressSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, Schema } from '@xyo-network/payload-model'

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

  protected override async divineHandler(payloads?: Payload[]) {
    assertEx(!payloads?.length, () => 'MemoryAddressSpaceDiviner.divine does not allow payloads to be sent')
    const archivistMod = assertEx(await this.archivistInstance(), () => 'Unable to resolve archivist')
    const archivist = ArchivistWrapper.wrap(archivistMod, this.account)
    const all = await archivist.all?.()
    const bwLists = all?.filter(isBoundWitnessWithStorageMeta) ?? []
    const addresses = new Set<Address>(bwLists.flatMap(bw => bw.addresses).map(address => address.toLowerCase() as Address))
    return await Promise.all(
      [...addresses].map(address => new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()),
    )
  }
}

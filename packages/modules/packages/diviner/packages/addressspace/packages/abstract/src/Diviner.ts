import { AbstractDirectDiviner } from '@xyo-network/abstract-diviner'
import { AddressSpaceDivinerParams } from '@xyo-network/diviner-address-space-model'

export abstract class AddressSpaceDiviner<
  TParams extends AddressSpaceDivinerParams = AddressSpaceDivinerParams,
> extends AbstractDirectDiviner<TParams> {}

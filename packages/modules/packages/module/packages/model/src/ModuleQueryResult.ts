import { BoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleError, Payload, WithMeta } from '@xyo-network/payload-model'

export type ModuleQueryResult<P extends Payload = Payload, E extends ModuleError = ModuleError, B extends BoundWitness = BoundWitness> = [
  WithMeta<B>,
  WithMeta<P>[],
  WithMeta<E>[],
]

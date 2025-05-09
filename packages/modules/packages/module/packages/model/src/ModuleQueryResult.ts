import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type {
  ModuleError, Payload, WithoutPrivateStorageMeta,
} from '@xyo-network/payload-model'

export type ModuleQueryResult<P extends Payload = Payload, E extends ModuleError = ModuleError, B extends BoundWitness = BoundWitness> = [
  WithoutPrivateStorageMeta<B>,
  WithoutPrivateStorageMeta<P>[],
  WithoutPrivateStorageMeta<E>[],
]

import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { Payload, WithStorageMeta } from '@xyo-network/payload-model'

export type HydratedBoundWitness<T extends BoundWitness = BoundWitness, P extends Payload = Payload> = [WithStorageMeta<T>, WithStorageMeta<P>[]]

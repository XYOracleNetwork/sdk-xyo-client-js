import type { BoundWitness, Signed } from '@xyo-network/boundwitness-model'
import type { Payload, WithStorageMeta } from '@xyo-network/payload-model'

export type HydratedBoundWitness<T extends BoundWitness = BoundWitness, P extends Payload = Payload> = [T, P[]]

export type HydratedBoundWitnessWithStorageMeta<T extends BoundWitness = BoundWitness, P extends Payload = Payload> = [WithStorageMeta<T>, WithStorageMeta<P>[]]

export type SignedHydratedBoundWitness<T extends Signed<BoundWitness> = Signed<BoundWitness>, P extends Payload = Payload> = [T, P[]]

export type SignedHydratedBoundWitnessWithStorageMeta<T extends Signed<BoundWitness> = Signed<BoundWitness>,
  P extends Payload = Payload> = [WithStorageMeta<T>, WithStorageMeta<P>[]]

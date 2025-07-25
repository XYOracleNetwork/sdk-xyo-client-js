import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { ModuleError, Payload } from '@xyo-network/payload-model'

export type ModuleQueryResult<P extends Payload = Payload, E extends ModuleError = ModuleError, B extends BoundWitness = BoundWitness> = [
  B,
  P[],
  E[],
]

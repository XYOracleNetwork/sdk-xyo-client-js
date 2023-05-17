import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import {
  BoundWitnessDivinerConfigSchema,
  BoundWitnessDivinerParams,
  BoundWitnessDivinerQueryPayload,
  BoundWitnessDivinerQuerySchema,
} from '@xyo-network/diviner-boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

export class MemoryBoundWitnessDiviner<TParams extends BoundWitnessDivinerParams = BoundWitnessDivinerParams> extends BoundWitnessDiviner<TParams> {
  static override configSchema = BoundWitnessDivinerConfigSchema

  override divine(payloads?: Payload[]): Promise<Payload[]> {
    throw new Error('Method not implemented.')
  }
}

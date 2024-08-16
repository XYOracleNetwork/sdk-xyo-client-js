import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type { BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { BoundWitnessDivinerConfigSchema } from '@xyo-network/diviner-boundwitness-model'
import type { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import type { Schema } from '@xyo-network/payload-model'

export abstract class BoundWitnessDiviner<
  TParams extends BoundWitnessDivinerParams = BoundWitnessDivinerParams,
  TIn extends BoundWitnessDivinerQueryPayload = BoundWitnessDivinerQueryPayload,
  TOut extends BoundWitness = BoundWitness,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, BoundWitnessDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = BoundWitnessDivinerConfigSchema
}

import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { BoundWitnessDivinerConfigSchema, BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { Schema } from '@xyo-network/payload-model'

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

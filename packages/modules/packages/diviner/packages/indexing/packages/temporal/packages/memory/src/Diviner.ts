import { IndexingDiviner } from '@xyo-network/diviner-indexing-memory'
import { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { TemporalIndexingDivinerConfigSchema, TemporalIndexingDivinerParams } from '@xyo-network/diviner-temporal-indexing-model'
import { Payload, Schema } from '@xyo-network/payload-model'

export class TemporalIndexingDiviner<
  TParams extends TemporalIndexingDivinerParams = TemporalIndexingDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends IndexingDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, TemporalIndexingDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = TemporalIndexingDivinerConfigSchema

  protected override async startHandler(): Promise<boolean> {
    await super.startHandler()
    return true
  }
}

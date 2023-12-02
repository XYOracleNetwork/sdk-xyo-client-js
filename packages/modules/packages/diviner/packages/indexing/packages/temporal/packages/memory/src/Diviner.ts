import { IndexingDiviner } from '@xyo-network/diviner-indexing-memory'
import { IndexingDivinerConfigSchema } from '@xyo-network/diviner-indexing-model'
import { DivinerConfigSchema, DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { TemporalIndexingDivinerConfigSchema, TemporalIndexingDivinerParams } from '@xyo-network/diviner-temporal-indexing-model'
import { Payload } from '@xyo-network/payload-model'

export class TemporalIndexingDiviner<
  TParams extends TemporalIndexingDivinerParams = TemporalIndexingDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends IndexingDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchema = TemporalIndexingDivinerConfigSchema
  static override readonly configSchemas: string[] = [TemporalIndexingDivinerConfigSchema, IndexingDivinerConfigSchema, DivinerConfigSchema]

  protected override async startHandler(): Promise<boolean> {
    await super.startHandler()
    return true
  }
}

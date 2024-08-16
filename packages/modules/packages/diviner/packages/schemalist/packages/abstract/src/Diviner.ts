import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import type { SchemaListDivinerParams } from '@xyo-network/diviner-schema-list-model'
import type { Payload } from '@xyo-network/payload-model'

export abstract class SchemaListDiviner<
  TParams extends SchemaListDivinerParams = SchemaListDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {}

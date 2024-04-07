import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { SchemaListDivinerParams } from '@xyo-network/diviner-schema-list-model'
import { Payload } from '@xyo-network/payload-model'

export abstract class SchemaListDiviner<
  TParams extends SchemaListDivinerParams = SchemaListDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams['config'], TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams['config'], TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {}

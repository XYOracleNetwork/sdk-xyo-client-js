import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { SchemaListDivinerParams } from '@xyo-network/diviner-schema-list-model'
import { Payload } from '@xyo-network/payload-model'

export abstract class SchemaListDiviner<
  TParams extends SchemaListDivinerParams = SchemaListDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> extends AbstractDiviner<TParams, TIn, TOut> {}

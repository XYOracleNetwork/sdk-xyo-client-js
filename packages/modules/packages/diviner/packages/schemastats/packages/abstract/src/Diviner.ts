import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { SchemaStatsDivinerParams } from '@xyo-network/diviner-schema-stats-model'
import { Payload } from '@xyo-network/payload-model'

export abstract class SchemaStatsDiviner<
  TParams extends SchemaStatsDivinerParams = SchemaStatsDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> extends AbstractDiviner<TParams, TIn, TOut> {}

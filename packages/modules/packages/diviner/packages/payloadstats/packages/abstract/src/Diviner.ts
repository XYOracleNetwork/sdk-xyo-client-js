import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { PayloadStatsDivinerParams } from '@xyo-network/diviner-payload-stats-model'
import { Payload } from '@xyo-network/payload-model'

export abstract class PayloadStatsDiviner<
  TParams extends PayloadStatsDivinerParams = PayloadStatsDivinerParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
> extends AbstractDiviner<TParams, TIn, TOut> {}

import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { PayloadStatsDivinerParams } from '@xyo-network/diviner-payload-stats-model'

export abstract class PayloadStatsDiviner<TParams extends PayloadStatsDivinerParams = PayloadStatsDivinerParams> extends AbstractDiviner<TParams> {}

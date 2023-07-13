import { AbstractDirectDiviner } from '@xyo-network/abstract-diviner'
import { PayloadDivinerParams } from '@xyo-network/diviner-payload-model'

export abstract class PayloadDiviner<TParams extends PayloadDivinerParams = PayloadDivinerParams> extends AbstractDirectDiviner<TParams> {}

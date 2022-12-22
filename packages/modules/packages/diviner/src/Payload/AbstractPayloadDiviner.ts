import { DivinerConfig } from '@xyo-network/diviner-model'

import { AbstractDiviner } from '../AbstractDiviner'

export abstract class AbstractPayloadDiviner<C extends DivinerConfig = DivinerConfig> extends AbstractDiviner<C> {}

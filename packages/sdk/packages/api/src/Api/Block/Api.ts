import { XyoBoundWitness } from '@xyo-network/boundwitness-model'

import { XyoApiSimple } from '../../Simple'

export class XyoArchivistArchiveBlockApi<
  T extends XyoBoundWitness[] = XyoBoundWitness[],
  C extends XyoBoundWitness[] = XyoBoundWitness[],
> extends XyoApiSimple<T, C> {}

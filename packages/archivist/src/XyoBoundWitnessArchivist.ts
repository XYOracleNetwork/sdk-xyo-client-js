import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoPayload } from '@xyo-network/payload'

import { XyoArchivist } from './XyoArchivist'

export abstract class XyoBoundWitnessArchivist<TWrite extends XyoBoundWitness = XyoBoundWitness, TRead extends XyoPayload = XyoPayload> extends XyoArchivist<TWrite, TRead> {}

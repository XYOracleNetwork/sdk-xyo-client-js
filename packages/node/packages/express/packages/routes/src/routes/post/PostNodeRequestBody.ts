import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { XyoPayload } from '@xyo-network/payload-model'

export type PostNodeRequestBody = XyoPayload | XyoBoundWitness | XyoPayload[] | XyoBoundWitness[]

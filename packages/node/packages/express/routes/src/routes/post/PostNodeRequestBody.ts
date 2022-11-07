import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoPayload } from '@xyo-network/payload'

export type PostNodeRequestBody = XyoPayload | XyoBoundWitness | XyoPayload[] | XyoBoundWitness[]

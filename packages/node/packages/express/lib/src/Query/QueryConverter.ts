import { Query } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload'
import { Request } from 'express'

export type QueryConverter<T extends XyoPayload = XyoPayload, R extends Request = Request> = (x: T, req: R) => Query

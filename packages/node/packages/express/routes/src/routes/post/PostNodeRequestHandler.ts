import { ArchivePathParams } from '@xyo-network/node-core-model'
import { RequestHandler } from 'express'

import { PostNodeRequestBody } from './PostNodeRequestBody'

export type PostNodeRequestHandler = RequestHandler<ArchivePathParams, string[][], PostNodeRequestBody>

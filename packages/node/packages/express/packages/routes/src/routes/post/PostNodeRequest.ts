import { ArchivePathParams } from '@xyo-network/node-core-model'
import { Request } from 'express'

import { PostNodeRequestBody } from './PostNodeRequestBody'

export type PostNodeRequest = Request<ArchivePathParams, string[][], PostNodeRequestBody>

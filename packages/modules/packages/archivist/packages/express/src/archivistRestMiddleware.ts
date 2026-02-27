import { setRawResponseFormat } from '@xylabs/express'
import {
  asHash, isDefined, isHash,
} from '@xylabs/sdk-js'
import type {
  ArchivistInstance,
  ArchivistNextOptions, NextOptions,
} from '@xyo-network/archivist-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import { isAnyPayload, isSequence } from '@xyo-network/payload-model'
import type { Request, Router } from 'express'
import express from 'express'

type ArchivistMiddlewareOptions = {
  archivist: ArchivistInstance
}

export const archivistRestMiddleware = (options: ArchivistMiddlewareOptions): Router => {
  const { archivist } = options
  const router = express.Router({ mergeParams: true })

  router.post('/insert', async (req, res) => {
    setRawResponseFormat(res)
    const body = Array.isArray(req.body) ? req.body : [req.body]
    const payloads = (await PayloadBuilder.hashPairs<Payload>(body)).map(p => p[0])
    const result = await archivist.insert(payloads)
    res.status(200).json(result)
  })

  router.get('/next', async (req: Request<Partial<NextOptions>>, res) => {
    setRawResponseFormat(res)
    const cursor = isSequence(req.query.cursor) ? req.query.cursor : undefined
    const limit = isDefined(req.query.limit) ? Number(req.query.limit) : undefined
    const open = isDefined(req.query.open) ? Boolean(req.query.open) : undefined
    const order = req.query.order === 'asc' ? 'asc' : 'desc'
    const options: ArchivistNextOptions = {
      limit, open, order, cursor,
    }
    const result = await archivist.next(options)
    res.status(200).json(result)
  })
  router.post('/next', async (req: Request<{}, {}, ArchivistNextOptions | undefined>, res) => {
    setRawResponseFormat(res)
    const options = req.body
    const result = await (isDefined(options) ? archivist.next(options) : archivist.next())
    res.status(200).json(result)
  })

  router.get('/get/:hash', async (req, res) => {
    setRawResponseFormat(res)
    const { hash: rawHash } = req.params
    const hash = asHash(rawHash)
    if (isHash(hash)) {
      const [payload] = await archivist.get([hash])
      if (isAnyPayload(payload)) {
        res.json(payload)
        return
      }
    }
    res.status(400).send()
  })

  return router
}

import { promises as dnsPromises } from 'node:dns'

import { axios, AxiosError, AxiosResponse } from '@xyo-network/axios'
import { PayloadHasher } from '@xyo-network/core'
import { ImageThumbnail, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlPayload } from '@xyo-network/url-payload-plugin'
import { AbstractWitness } from '@xyo-network/witness'
import { subClass } from 'gm'
import { sync as hasbin } from 'hasbin'
import { sha256 } from 'hash-wasm'
import compact from 'lodash/compact'
import { LRUCache } from 'lru-cache'
import shajs from 'sha.js'
import Url from 'url-parse'

import { ImageThumbnailWitnessConfigSchema } from './Config'
import { ImageThumbnailWitnessParams } from './Params'

//TODO: Break this into two Witnesses?

const gm = subClass({ imageMagick: '7+' })

export interface ImageThumbnailWitnessError extends Error {
  name: 'ImageThumbnailWitnessError'
  url: string
}

export interface DnsError extends Error {
  code: string
}

export class ImageThumbnailWitness<TParams extends ImageThumbnailWitnessParams = ImageThumbnailWitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [ImageThumbnailWitnessConfigSchema]

  private _cache?: LRUCache<string, ImageThumbnail>

  get cache() {
    this._cache = this._cache ?? new LRUCache<string, ImageThumbnail>({ max: this.maxCacheEntries })
    return this._cache
  }

  get encoding() {
    return this.config.encoding ?? 'PNG'
  }

  get height() {
    return this.config.height ?? 128
  }

  get maxCacheEntries() {
    return this.config.maxCacheEntries ?? 5000
  }

  get quality() {
    return this.config.quality ?? 50
  }

  get width() {
    return this.config.width ?? 128
  }

  static checkIpfsUrl(urlToCheck: string) {
    const url = new Url(urlToCheck)
    let protocol = url.protocol
    let host = url.host
    let path = url.pathname
    const query = url.query
    if (protocol === 'ipfs:') {
      protocol = 'https:'
      host = 'cloudflare-ipfs.com'
      path = url.host === 'ipfs' ? `ipfs${path}` : `ipfs/${url.host}${path}`
      const root = `${protocol}//${host}/${path}`
      return query?.length > 0 ? `root?${query}` : root
    } else {
      return urlToCheck
    }
  }

  private static async binaryToSha256(data: Uint8Array) {
    await PayloadHasher.wasmInitialized
    if (PayloadHasher.wasmSupport.canUseWasm) {
      try {
        return await sha256(data)
      } catch (ex) {
        PayloadHasher.wasmSupport.allowWasm = false
      }
    }
    // eslint-disable-next-line deprecation/deprecation
    return shajs('sha256').update(data).digest().toString()
  }

  private static bufferFromDataUrl(url: string): Buffer | undefined {
    if (url.startsWith('data:image')) {
      const data = url.split(',')[1]
      if (data) {
        const buffer = Buffer.from(Uint8Array.from(atob(data), (c) => c.charCodeAt(0)))
        console.log(`data buffer: ${buffer.length}`)
        return buffer
      } else {
        const error: ImageThumbnailWitnessError = {
          message: 'Invalid data Url',
          name: 'ImageThumbnailWitnessError',
          url,
        }
        throw error
      }
    }
  }

  protected override async observeHandler(payloads: UrlPayload[] = []): Promise<ImageThumbnail[]> {
    if (!hasbin('magick')) {
      throw Error('ImageMagick is required for this witness')
    }
    return compact(
      await Promise.all(
        payloads.map<Promise<ImageThumbnail>>(async ({ url }) => {
          const cachedResult = this.cache.get(url)
          if (cachedResult) {
            return cachedResult
          }
          let result: ImageThumbnail

          //if it is a data URL, return a Buffer
          const dataBuffer = ImageThumbnailWitness.bufferFromDataUrl(url)

          if (dataBuffer) {
            result = {
              schema: ImageThumbnailSchema,
              sourceHash: await ImageThumbnailWitness.binaryToSha256(dataBuffer),
              sourceUrl: url,
              url,
            }
          } else {
            //if it is ipfs, go through cloud flair
            const mutatedUrl = ImageThumbnailWitness.checkIpfsUrl(url)
            result = await this.fromHttp(mutatedUrl)
          }
          this.cache.set(url, result)
          return result
        }),
      ),
    )
  }

  private async createThumbnail(sourceBuffer: Buffer) {
    const thumb = await new Promise<Buffer>((resolve, reject) => {
      gm(sourceBuffer)
        .quality(this.quality)
        .resize(this.width, this.height)
        .flatten()
        .toBuffer(this.encoding, (error, buffer) => {
          if (error) {
            reject(error)
          } else {
            resolve(buffer)
          }
        })
    })
    return `data:image/png;base64,${thumb.toString('base64')}`
  }

  private async fromHttp(url: string): Promise<ImageThumbnail> {
    let response: AxiosResponse
    let dnsResult: string[]
    try {
      const urlObj = new Url(url)
      dnsResult = await dnsPromises.resolve(urlObj.host)
      // console.log(`dnsResult: ${JSON.stringify(dnsResult, null, 2)}`)
    } catch (ex) {
      const error = ex as DnsError
      const result: ImageThumbnail = {
        http: {
          dnsError: error.code,
        },
        schema: ImageThumbnailSchema,
        sourceUrl: url,
      }
      return result
    }
    try {
      response = await axios.get(url, {
        responseType: 'arraybuffer',
      })
    } catch (ex) {
      const axiosError = ex as AxiosError
      if (axiosError.isAxiosError) {
        //selectively pick fields from AxiosError
        const result: ImageThumbnail = {
          http: {
            ipAddress: dnsResult[0],
            status: axiosError?.response?.status,
          },
          schema: ImageThumbnailSchema,
          sourceUrl: url,
        }
        return result
      } else {
        throw ex
      }
    }

    const result: ImageThumbnail = {
      http: {
        status: response.status,
      },
      schema: ImageThumbnailSchema,
      sourceUrl: url,
    }

    if (response.status >= 200 && response.status < 300) {
      const contentType = response.headers['content-type']?.toString()
      if (contentType.split('/')[0] !== 'image') {
        result.mime = result.mime ?? {}
        result.mime.invalid = true
      } else {
        const sourceBuffer = Buffer.from(response.data, 'binary')
        result.sourceHash = await ImageThumbnailWitness.binaryToSha256(sourceBuffer)
        result.url = await this.createThumbnail(sourceBuffer)
      }
    }
    return result
  }
}

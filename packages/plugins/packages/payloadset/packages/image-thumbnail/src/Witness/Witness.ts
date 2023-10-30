/* eslint-disable max-statements */
import { promises as dnsPromises } from 'node:dns'

import { compact } from '@xylabs/lodash'
import { URL } from '@xylabs/url'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { axios, AxiosError, AxiosResponse } from '@xyo-network/axios'
import { PayloadHashableAnalyzer, PayloadHasher } from '@xyo-network/core'
import { ImageThumbnail, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import { Semaphore } from 'async-mutex'
import FileType from 'file-type'
import graphicsMagick from 'gm'
import hasbin from 'hasbin'
import { sha256 } from 'hash-wasm'
import shajs from 'sha.js'
import Url from 'url-parse'

import { ImageThumbnailEncoding, ImageThumbnailWitnessConfigSchema } from './Config'
import { getVideoFrameAsImageFluent } from './ffmpeg'
import { ImageThumbnailWitnessParams } from './Params'

//TODO: Break this into two Witnesses?

// setFfmpegPath(ffmpegPath)

// eslint-disable-next-line import/no-named-as-default-member
const gm = graphicsMagick.subClass({ imageMagick: '7+' })

export interface ImageThumbnailWitnessError extends Error {
  name: 'ImageThumbnailWitnessError'
  url: string
}

export interface DnsError extends Error {
  code: string
}

export class ImageThumbnailWitness<TParams extends ImageThumbnailWitnessParams = ImageThumbnailWitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [ImageThumbnailWitnessConfigSchema]

  private _semaphore = new Semaphore(this.maxAsyncProcesses)

  get encoding() {
    return this.config.encoding ?? 'PNG'
  }

  get height() {
    return this.config.height ?? 128
  }

  get ipfGateway() {
    return this.config.ipfsGateway ?? '5d7b6582.beta.decentralnetworkservices.com'
  }

  get maxAsyncProcesses() {
    return this.config.maxAsyncProcesses ?? 2
  }

  get quality() {
    return this.config.quality ?? 50
  }

  get width() {
    return this.config.width ?? 128
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

    return shajs('sha256').update(data).digest().toString()
  }

  private static bufferFromDataUrl(url: string): Buffer | undefined {
    if (url.startsWith('data:image')) {
      const data = url.split(',')[1]
      if (data) {
        return Buffer.from(Uint8Array.from(atob(data), (c) => c.charCodeAt(0)))
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

  /**
   * Returns the equivalent IPFS gateway URL for the supplied URL.
   * @param urlToCheck The URL to check
   * @returns If the supplied URL is an IPFS URL, it converts the URL to the
   * equivalent IPFS gateway URL. Otherwise, returns the original URL.
   */
  checkIpfsUrl(urlToCheck: string) {
    const url = new URL(urlToCheck)
    let protocol = url.protocol
    let host = url.host
    let path = url.pathname
    const query = url.search
    if (protocol === 'ipfs:') {
      protocol = 'https:'
      host = this.ipfGateway
      path = url.host === 'ipfs' ? `ipfs${path}` : `ipfs/${url.host}${path}`
      const root = `${protocol}//${host}/${path}`
      return query?.length > 0 ? `${root}?${query}` : root
    } else {
      return urlToCheck
    }
  }

  protected override async observeHandler(payloads: UrlPayload[] = []): Promise<ImageThumbnail[]> {
    // eslint-disable-next-line import/no-named-as-default-member
    if (!hasbin.sync('magick')) {
      throw Error('ImageMagick is required for this witness')
    }
    const urlPayloads = payloads.filter((payload) => payload.schema === UrlSchema)
    return await this._semaphore.runExclusive(async () =>
      compact(
        await Promise.all(
          urlPayloads.map<Promise<ImageThumbnail>>(async ({ url }) => {
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
              const mutatedUrl = this.checkIpfsUrl(url)
              result = await this.fromHttp(mutatedUrl, url)
            }
            return result
          }),
        ),
      ),
    )
  }

  private async createThumbnailDataUrl(sourceBuffer: Buffer, encoding?: ImageThumbnailEncoding) {
    const thumb = await new Promise<Buffer>((resolve, reject) => {
      gm(sourceBuffer)
        .quality(this.quality)
        .resize(this.width, this.height)
        .flatten()
        .toBuffer(encoding ?? this.encoding, (error, buffer) => {
          if (error) {
            reject(error)
          } else {
            resolve(buffer)
          }
        })
    })
    return `data:image/png;base64,${thumb.toString('base64')}`
  }

  /**
   * Creates an image thumbnail from a video.
   * @param videoBuffer The input video buffer.
   * @returns An buffer containing an image thumbnail for the video.
   */
  private async createThumbnailFromVideo(videoBuffer: Buffer) {
    const imageBuffer = await getVideoFrameAsImageFluent(videoBuffer)
    return this.createThumbnailDataUrl(imageBuffer)
  }

  // eslint-disable-next-line complexity
  private async fromHttp(url: string, sourceUrl?: string): Promise<ImageThumbnail> {
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
          code: error.code,
        },
        schema: ImageThumbnailSchema,
        sourceUrl: sourceUrl ?? url,
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
          },
          schema: ImageThumbnailSchema,
          sourceUrl: sourceUrl ?? url,
        }
        if (axiosError?.response?.status !== undefined) {
          result.http = result.http ?? {}
          result.http.status = axiosError?.response?.status
        }
        if (axiosError?.code !== undefined) {
          result.http = result.http ?? {}
          result.http.code = axiosError?.code
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
      sourceUrl: sourceUrl ?? url,
    }

    if (response.status >= 200 && response.status < 300) {
      const contentType: string | undefined = response.headers['content-type']?.toString()
      const [mediaType, fileType] = contentType?.split('/') ?? ['', '']
      result.mime = result.mime ?? {}
      result.mime.returned = mediaType
      const sourceBuffer = Buffer.from(response.data, 'binary')

      try {
        result.mime.detected = await FileType.fromBuffer(sourceBuffer)
      } catch (ex) {
        const error = ex as Error
        this.logger?.error(`FileType error: ${error.message}`)
      }

      const processImage = async (encoding?: ImageThumbnailEncoding) => {
        result.sourceHash = await ImageThumbnailWitness.binaryToSha256(sourceBuffer)
        result.url = await this.createThumbnailDataUrl(sourceBuffer, encoding)
      }

      const processVideo = async () => {
        // Gracefully handle the case where ffmpeg is not installed.
        // eslint-disable-next-line import/no-named-as-default-member
        if (hasbin.sync('ffmpeg')) {
          result.sourceHash = await ImageThumbnailWitness.binaryToSha256(sourceBuffer)
          result.url = await this.createThumbnailFromVideo(sourceBuffer)
        } else {
          result.mime = result.mime ?? {}
          result.mime.invalid = true
        }
      }

      let encoding: ImageThumbnailEncoding = 'PNG'

      switch (fileType.toUpperCase()) {
        case 'GIF':
          encoding = 'GIF'
          break
        case 'JPG':
        case 'JPEG':
          encoding = 'JPG'
          break
      }

      switch (mediaType) {
        case 'image': {
          await processImage(encoding)
          result.mime.type = mediaType
          break
        }
        case 'video': {
          await processVideo()
          result.mime.type = mediaType
          break
        }
        default: {
          const [detectedMediaType] = result.mime.detected?.mime?.split('/') ?? ['', '']
          switch (detectedMediaType) {
            case 'image': {
              await processImage()
              result.mime.type = result.mime.detected?.mime
              break
            }
            case 'video': {
              await processVideo()
              result.mime.type = result.mime.detected?.mime
              break
            }
            default: {
              result.mime.invalid = true
              break
            }
          }
          break
        }
      }
    }
    const errors = await PayloadHashableAnalyzer.analyze(result)
    if (errors.length === 0) {
      console.log('ImageThumbnailWitness: No Hashable Errors')
    }
    errors.forEach((error) => {
      console.error(`ImageThumbnailWitness: ${error.message}`)
    })
    return JSON.parse(JSON.stringify(result))
  }
}

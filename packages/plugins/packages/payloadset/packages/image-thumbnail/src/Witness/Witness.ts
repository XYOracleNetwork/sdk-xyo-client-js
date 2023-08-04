import { axios } from '@xyo-network/axios'
import { PayloadHasher } from '@xyo-network/core'
import { ImageThumbnailPayload, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlPayload } from '@xyo-network/url-payload-plugin'
import { AbstractWitness } from '@xyo-network/witness'
import { subClass } from 'gm'
import { sha256 } from 'hash-wasm'
import compact from 'lodash/compact'
import shajs from 'sha.js'

import { ImageThumbnailWitnessConfigSchema } from './Config'
import { ImageThumbnailWitnessParams } from './Params'

const gm = subClass({ imageMagick: '7+' })

export const binaryToSha256 = async (data: Uint8Array) => {
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

export class ImageThumbnailWitness<TParams extends ImageThumbnailWitnessParams = ImageThumbnailWitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [ImageThumbnailWitnessConfigSchema]

  protected override async observeHandler(payloads: UrlPayload[] = []): Promise<ImageThumbnailPayload[]> {
    return compact(
      await Promise.all(
        payloads.map(async ({ url }) => {
          //if it is ipfs, go through cloud flair
          const mutatedUrl = url.replace('ipfs://', 'https://cloudflare-ipfs.com/')
          const response = await axios.get(mutatedUrl, {
            responseType: 'arraybuffer',
          })
          if (response.status >= 200 && response.status < 300) {
            const bytes = Buffer.from(response.data, 'binary')
            const thumb = await new Promise<Buffer>((resolve, reject) => {
              gm(bytes)
                .resize(128, 128)
                .toBuffer('PNG', (error, buffer) => {
                  if (error) {
                    reject(error)
                  } else {
                    resolve(buffer)
                  }
                })
            })
            const result: ImageThumbnailPayload = {
              schema: ImageThumbnailSchema,
              sourceHash: await binaryToSha256(bytes),
              sourceUrl: url,
              url: `data:image/png;base64,${thumb.toString('base64')}`,
            }
            return result
          }
        }),
      ),
    )
  }
}

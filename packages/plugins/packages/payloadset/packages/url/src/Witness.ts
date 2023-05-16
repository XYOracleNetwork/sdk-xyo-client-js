import { assertEx } from '@xylabs/assert'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import { AbstractWitness, WitnessConfig, WitnessParams } from '@xyo-network/witness'

import { hashUrl } from './util'

export type UrlWitnessConfigSchema = 'network.xyo.url.witness.config'
export const UrlWitnessConfigSchema: UrlWitnessConfigSchema = 'network.xyo.url.witness.config'

export type UrlWitnessConfig = WitnessConfig<{
  schema: UrlWitnessConfigSchema
  url?: string
}>

export type UrlWitnessParams = WitnessParams<AnyConfigSchema<UrlWitnessConfig>>

export class UrlWitness<TParams extends UrlWitnessParams = UrlWitnessParams> extends AbstractWitness<TParams> {
  static override configSchema = UrlWitnessConfigSchema

  get url() {
    return assertEx(this.config?.url)
  }

  override async observe(payloads: Payload[] = []): Promise<Payload[]> {
    // TODO: Hash input payloads via stream
    const filtered = payloads.filter((p) => p.schema === UrlSchema) as UrlPayload[]
    const urls =
      filtered.length > 0
        ? filtered.map((p) => {
            return {
              schema: UrlSchema,
              url: p.url,
            }
          })
        : [
            {
              schema: UrlSchema,
              url: this.url,
            },
          ]
    const hashed = await Promise.all(
      urls.map(async (url) => {
        // TODO: Different schema for hashed url
        return { ...url, hash: await hashUrl(url.url) }
      }),
    )
    // TODO: Handle partial success
    return await super.observe(hashed)
  }
}

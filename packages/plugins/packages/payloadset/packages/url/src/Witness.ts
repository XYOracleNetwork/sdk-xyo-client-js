import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import { AbstractWitness, WitnessConfig, WitnessParams } from '@xyo-network/witness'

import { hashUrl } from './util'

export const UrlWitnessConfigSchema = `${UrlSchema}.witness.config` as const
export type UrlWitnessConfigSchema = typeof UrlWitnessConfigSchema

export type UrlWitnessConfig = WitnessConfig<{
  schema: UrlWitnessConfigSchema
  url?: string
}>

export type UrlWitnessParams = WitnessParams<AnyConfigSchema<UrlWitnessConfig>>

export class UrlWitness<TParams extends UrlWitnessParams = UrlWitnessParams> extends AbstractWitness<TParams> {
  static override configSchema = UrlWitnessConfigSchema

  get url() {
    return this.config?.url
  }

  override async observe(payloads: Payload[] = []): Promise<Payload[]> {
    const urls: UrlPayload[] = this.url
      ? [{ schema: UrlSchema, url: this.url }]
      : payloads
          .filter((p): p is UrlPayload => p.schema === UrlSchema)
          .map((p) => {
            return { schema: UrlSchema, url: p.url }
          })
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

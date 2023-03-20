import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams, XyoWitnessConfig } from '@xyo-network/witness'
import { createServer, Server } from 'http'
import compact from 'lodash/compact'
import { collectDefaultMetrics, Registry } from 'prom-client'

import { PrometheusMetricValuePayload, PrometheusMetricValueSchema } from './Plugin'

export type PrometheusNodeWitnessConfigSchema = 'network.xyo.prometheus.node.witness.config'
export const PrometheusNodeWitnessConfigSchema: PrometheusNodeWitnessConfigSchema = 'network.xyo.prometheus.node.witness.config'

export type PrometheusNodeWitnessConfig = XyoWitnessConfig<{
  port?: number
  schema: PrometheusNodeWitnessConfigSchema
}>

export type PrometheusNodeWitnessParams = WitnessParams<AnyConfigSchema<PrometheusNodeWitnessConfig>>

export class PrometheusNodeWitness<TParams extends PrometheusNodeWitnessParams = PrometheusNodeWitnessParams> extends AbstractWitness<TParams> {
  static override configSchema = PrometheusNodeWitnessConfigSchema
  protected _registry = new Registry()
  protected server?: Server

  get registry(): Registry {
    return this._registry
  }

  override async observe(_payloads?: Partial<Payload>[]): Promise<Payload[]> {
    return await super.observe(await this.generateMetricValues())
  }

  override async start(timeout?: number) {
    collectDefaultMetrics({ register: this._registry })
    this.server = createServer(async (_request, response) => {
      response.writeHead(200)

      response.end(await this._registry.metrics())
    })
    this.server.listen(this.config.port ?? 3033)
    return await super.start(timeout)
  }

  override stop(_timeout?: number) {
    this.server?.close()
    return this
  }

  private async generateMetricValues(): Promise<PrometheusMetricValuePayload[]> {
    return compact(
      (await this._registry.getMetricsAsJSON()).map((metric) => {
        const values = metric.values
        if (values) {
          return { aggregator: metric.aggregator, name: metric.name, schema: PrometheusMetricValueSchema, type: metric.type, values }
        }
      }),
    )
  }
}

import { AnyConfigSchema, creatableModule } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessConfig, WitnessParams } from '@xyo-network/witness'
import { createServer, Server } from 'http'
import compact from 'lodash/compact'
import { collectDefaultMetrics, Registry } from 'prom-client'

import { PrometheusMetricValuePayload } from './Payload'
import { PrometheusMetricValueSchema } from './Schema'

export type PrometheusNodeWitnessConfigSchema = 'network.xyo.prometheus.node.witness.config'
export const PrometheusNodeWitnessConfigSchema: PrometheusNodeWitnessConfigSchema = 'network.xyo.prometheus.node.witness.config'

export type PrometheusNodeWitnessConfig = WitnessConfig<{
  port?: number
  schema: PrometheusNodeWitnessConfigSchema
}>

export type PrometheusNodeWitnessParams = WitnessParams<AnyConfigSchema<PrometheusNodeWitnessConfig>>

creatableModule()
export class PrometheusNodeWitness<TParams extends PrometheusNodeWitnessParams = PrometheusNodeWitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [PrometheusNodeWitnessConfigSchema]
  protected _registry = new Registry()
  protected server?: Server

  get registry(): Registry {
    return this._registry
  }

  protected override async observeHandler(_payloads?: Partial<Payload>[]): Promise<Payload[]> {
    return await this.generateMetricValues()
  }

  protected override async startHandler() {
    collectDefaultMetrics({ register: this._registry })
    if (this.config.port) {
      this.server = createServer(async (_request, response) => {
        response.writeHead(200)

        response.end(await this._registry.metrics())
      })
      this.server.listen(this.config.port)
    }
    return await super.startHandler()
  }

  protected override stopHandler() {
    this.server?.close()
    return super.stopHandler()
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

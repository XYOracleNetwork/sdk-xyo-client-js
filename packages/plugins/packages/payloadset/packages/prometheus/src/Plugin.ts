import { Payload, PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'
import { Aggregator, MetricType } from 'prom-client'

import { PrometheusNodeWitness } from './Witness'

export type PrometheusMetricValueSchema = 'network.xyo.prometheus.metric.value'
export const PrometheusMetricValueSchema: PrometheusMetricValueSchema = 'network.xyo.prometheus.metric.value'

export type PrometheusMetricValuePayload = Payload<
  {
    aggregator: Aggregator
    name: string
    type: MetricType
    values: (number | string | object)[]
  },
  PrometheusMetricValueSchema
>

export const PrometheusNodePlugin = () =>
  createPayloadSetWitnessPlugin<PrometheusNodeWitness>(
    { required: { [PrometheusMetricValueSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await PrometheusNodeWitness.create(params)
        return result
      },
    },
  )

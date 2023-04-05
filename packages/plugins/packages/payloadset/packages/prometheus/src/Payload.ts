import { Payload } from '@xyo-network/payload-model'
import { Aggregator, MetricType } from 'prom-client'

import { PrometheusMetricValueSchema } from './Schema'

export type PrometheusMetricValuePayload = Payload<
  {
    aggregator: Aggregator
    name: string
    type: MetricType
    values: (number | string | object)[]
  },
  PrometheusMetricValueSchema
>

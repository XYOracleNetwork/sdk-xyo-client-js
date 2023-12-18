import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { SentinelIntervalAutomationPayload } from '@xyo-network/sentinel-model'

export class SentinelIntervalAutomationWrapper<
  T extends SentinelIntervalAutomationPayload = SentinelIntervalAutomationPayload,
> extends PayloadWrapper<T> {
  constructor(payload: T) {
    super(payload)
  }

  protected get frequencyMillis() {
    const frequency = this.jsonPayload().frequency
    if (frequency === undefined) return Number.POSITIVE_INFINITY
    switch (this.jsonPayload().frequencyUnits ?? 'hour') {
      case 'second': {
        return frequency * 1000
      }
      case 'minute': {
        return frequency * 60 * 1000
      }
      case 'hour': {
        return frequency * 60 * 60 * 1000
      }
      case 'day': {
        return frequency * 24 * 60 * 60 * 1000
      }
    }
  }

  protected get remaining() {
    //if remaining is not defined, we assume Infinity
    return this.payload().remaining ?? Number.POSITIVE_INFINITY
  }

  next() {
    this.jsonPayload().start = this.jsonPayload().start + this.frequencyMillis
    this.consumeRemaining()
    this.checkEnd()
    return this
  }

  protected checkEnd() {
    if (this.jsonPayload().start > (this.jsonPayload().end ?? Number.POSITIVE_INFINITY)) {
      this.jsonPayload().start = Number.POSITIVE_INFINITY
    }
  }

  protected consumeRemaining(count = 1) {
    const remaining = this.remaining - count
    this.jsonPayload().remaining = remaining

    if (remaining <= 0) {
      this.jsonPayload().start = Number.POSITIVE_INFINITY
    }
  }
}

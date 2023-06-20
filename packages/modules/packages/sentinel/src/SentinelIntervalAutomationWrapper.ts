import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { SentinelIntervalAutomationPayload } from './Automation'

export class SentinelIntervalAutomationWrapper<
  T extends SentinelIntervalAutomationPayload = SentinelIntervalAutomationPayload,
> extends PayloadWrapper<T> {
  constructor(payload: T) {
    super(payload)
  }

  protected get frequencyMillis() {
    const frequency = this.payload().frequency
    if (frequency === undefined) return Infinity
    switch (this.payload().frequencyUnits ?? 'hour') {
      case 'second':
        return frequency * 1000
      case 'minute':
        return frequency * 60 * 1000
      case 'hour':
        return frequency * 60 * 60 * 1000
      case 'day':
        return frequency * 24 * 60 * 60 * 1000
    }
  }

  protected get remaining() {
    //if remaining is not defined, we assume Infinity
    return this.payload().remaining ?? Infinity
  }

  next() {
    this.payload().start = this.payload().start + this.frequencyMillis
    this.consumeRemaining()
    this.checkEnd()
    return this
  }

  protected checkEnd() {
    if (this.payload().start > (this.payload().end ?? Infinity)) {
      this.payload().start = Infinity
    }
  }

  protected consumeRemaining(count = 1) {
    const remaining = this.remaining - count
    this.payload().remaining = remaining

    if (remaining <= 0) {
      this.payload().start = Infinity
    }
  }
}

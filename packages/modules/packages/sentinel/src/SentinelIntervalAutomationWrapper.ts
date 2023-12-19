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
    const frequencyUnits = this.jsonPayload().frequencyUnits
    switch (frequencyUnits ?? 'hour') {
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
      default: {
        return Number.POSITIVE_INFINITY
      }
    }
  }

  protected get remaining() {
    //if remaining is not defined, we assume Infinity
    return this.payload().remaining ?? Number.POSITIVE_INFINITY
  }

  next() {
    const now = Date.now()
    const previousStart = this.jsonPayload()?.start ?? now
    const start = Math.max(previousStart, now)
    const nextStart = start + this.frequencyMillis
    this.setStart(nextStart)
    this.consumeRemaining()
    this.checkEnd()
    return this
  }

  protected checkEnd() {
    if (this.jsonPayload().start > (this.jsonPayload().end ?? Number.POSITIVE_INFINITY)) {
      this.setStart(Number.POSITIVE_INFINITY)
    }
  }

  protected consumeRemaining(count = 1) {
    const remaining = this.remaining - count
    this.setRemaining(remaining)
    if (remaining <= 0) this.setStart(Number.POSITIVE_INFINITY)
  }

  /**
   * Sets the remaining of the wrapped automation
   * @param remaining The remaining time in milliseconds
   */
  protected setRemaining(remaining: number) {
    this.obj.remaining = remaining
  }

  /**
   * Sets the start of the wrapped automation
   * @param start The start time in milliseconds
   */
  protected setStart(start: number) {
    this.obj.start = start
  }
}

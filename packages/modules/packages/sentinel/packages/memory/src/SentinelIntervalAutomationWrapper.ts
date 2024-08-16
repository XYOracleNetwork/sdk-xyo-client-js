import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import type { SentinelIntervalAutomationPayload } from '@xyo-network/sentinel-model'

export class SentinelIntervalAutomationWrapper<
  T extends SentinelIntervalAutomationPayload = SentinelIntervalAutomationPayload,
> extends PayloadWrapper<T> {
  constructor(payload: T) {
    super(payload)
  }

  protected get frequencyMillis() {
    const frequency = this.payload.frequency
    if (frequency === undefined) return Number.POSITIVE_INFINITY
    const frequencyUnits = this.payload.frequencyUnits
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
    return this.payload.remaining ?? Number.POSITIVE_INFINITY
  }

  next() {
    const now = Date.now()
    const previousStart = this.payload?.start ?? now
    const start = Math.max(previousStart, now)
    const nextStart = start + this.frequencyMillis
    this.setStart(nextStart)
    this.consumeRemaining()
    this.checkEnd()
    return this
  }

  protected checkEnd() {
    if (this.payload.start > (this.payload.end ?? Number.POSITIVE_INFINITY)) {
      this.setStart(Number.POSITIVE_INFINITY)
    }
  }

  protected consumeRemaining(count = 1) {
    const remaining = Math.max(this.remaining - count, 0)
    this.setRemaining(remaining)
    if (remaining <= 0) this.setStart(Number.POSITIVE_INFINITY)
  }

  /**
   * Sets the remaining of the wrapped automation
   * @param remaining The remaining time in milliseconds
   */
  protected setRemaining(remaining: number) {
    this.payload.remaining = remaining
  }

  /**
   * Sets the start of the wrapped automation
   * @param start The start time in milliseconds
   */
  protected setStart(start: number) {
    this.payload.start = start
  }
}

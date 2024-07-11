import { Payload } from './Payload.js'

/**
 * Type corresponding to the properties of a payload
 */
export type PayloadProperty<
  /**
   * The type of payload
   */
  T extends Payload = Payload,
> = keyof T

/**
 * Type corresponding to the payload values
 */
export type PayloadValue<
  /**
   * The type of payload
   */
  T extends Payload = Payload,
  /**
   * The property of the payload to select
   */
  Key extends PayloadProperty<T> = PayloadProperty<T>,
> = T[Key]

/**
 * An expressions that selects a property value from the payload
 */
export type PayloadValueExpression<
  /**
   * The type of payload
   */
  T extends Payload = Payload,
  /**
   * The property of the payload to select
   */
  Key extends PayloadProperty<T> = PayloadProperty<T>,
  /**
   * The type of the selected property's value
   */
  TValue = PayloadValue<T, Key>,
> = (payload: T) => TValue

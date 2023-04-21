/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare interface ARIMAOptions {
  auto?: boolean // automatic ARIMA (default: false)
  // params for ARIMA (default: p: 1, d: 0, q: 1)
  p?: number
  d?: number
  q?: number
  // seasonal params (default: 0s). Setting them to non-zero values makes the ARIMA model seasonal
  P?: number
  D?: number
  Q?: number
  s?: number
  method?: number // ARIMA method (default: 0)
  optimizer?: number // optimization method (default: 6)
  transpose?: boolean //transpose exogenous array when fitting SARIMAX (default: false)
  verbose?: boolean // verbose output (default: true)
}

declare module 'arima' {
  export { ARIMAOptions }

  // eslint-disable-next-line import/no-default-export
  export default class ARIMA {
    constructor(options: ARIMAOptions)
    predict(steps: number): number[]
  }
}

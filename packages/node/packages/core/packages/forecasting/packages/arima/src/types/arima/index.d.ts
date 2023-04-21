/* eslint-disable @typescript-eslint/member-ordering */

declare type ARIMAMethod =
  | 0 // Exact Maximum Likelihood Method (Default)
  | 1 // Conditional Method - Sum Of Squares
  | 2 // Box-Jenkins Method

declare type OptimizationMethod =
  | 0 // Nelder-Mead
  | 1 // Newton Line Search
  | 2 // Newton Trust Region - Hook Step
  | 3 // Newton Trust Region - Double Dog-Leg
  | 4 // Conjugate Gradient
  | 5 // BFGS
  | 6 // Limited Memory BFGS (Default)
  | 7 // BFGS Using More Thuente Method

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
  method?: ARIMAMethod // ARIMA method (default: 0)
  optimizer?: OptimizationMethod // optimization method (default: 6)
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

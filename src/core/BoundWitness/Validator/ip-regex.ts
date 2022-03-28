// Originally from https://raw.githubusercontent.com/sindresorhus/ip-regex under MIT license
// Copied here because it didn't support CommonJS style require

/*
MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export interface Options {
  /**
   * Only match an exact string. Useful with `RegExp#test()` to check if a string is an IP address. *(`false` matches any IP address in a string)*
   * @default false
   */
  readonly exact?: boolean

  /**
   * Include boundaries in the regex. When `true`, `192.168.0.2000000000` will report as an invalid IPv4 address. If this option is not set, the mentioned IPv4 address would report as valid (ignoring the trailing zeros).
   * @default false
   *
   */
  readonly includeBoundaries?: boolean
}

const word = '[a-fA-F\\d:]'

const boundry = (options?: Options) =>
  options && options.includeBoundaries ? `(?:(?<=\\s|^)(?=${word})|(?<=${word})(?=\\s|$))` : ''

const v4 = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}'

const v6segment = '[a-fA-F\\d]{1,4}'

const v6 = `
(?:
(?:${v6segment}:){7}(?:${v6segment}|:)|                                    // 1:2:3:4:5:6:7::  1:2:3:4:5:6:7:8
(?:${v6segment}:){6}(?:${v4}|:${v6segment}|:)|                             // 1:2:3:4:5:6::    1:2:3:4:5:6::8   1:2:3:4:5:6::8  1:2:3:4:5:6::1.2.3.4
(?:${v6segment}:){5}(?::${v4}|(?::${v6segment}){1,2}|:)|                   // 1:2:3:4:5::      1:2:3:4:5::7:8   1:2:3:4:5::8    1:2:3:4:5::7:1.2.3.4
(?:${v6segment}:){4}(?:(?::${v6segment}){0,1}:${v4}|(?::${v6segment}){1,3}|:)| // 1:2:3:4::        1:2:3:4::6:7:8   1:2:3:4::8      1:2:3:4::6:7:1.2.3.4
(?:${v6segment}:){3}(?:(?::${v6segment}){0,2}:${v4}|(?::${v6segment}){1,4}|:)| // 1:2:3::          1:2:3::5:6:7:8   1:2:3::8        1:2:3::5:6:7:1.2.3.4
(?:${v6segment}:){2}(?:(?::${v6segment}){0,3}:${v4}|(?::${v6segment}){1,5}|:)| // 1:2::            1:2::4:5:6:7:8   1:2::8          1:2::4:5:6:7:1.2.3.4
(?:${v6segment}:){1}(?:(?::${v6segment}){0,4}:${v4}|(?::${v6segment}){1,6}|:)| // 1::              1::3:4:5:6:7:8   1::8            1::3:4:5:6:7:1.2.3.4
(?::(?:(?::${v6segment}){0,5}:${v4}|(?::${v6segment}){1,7}|:))             // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8             ::1.2.3.4
)(?:%[0-9a-zA-Z]{1,})?                                             // %eth0            %1
`
  .replace(/\s*\/\/.*$/gm, '')
  .replace(/\n/g, '')
  .trim()

// Pre-compile only the exact regexes because adding a global flag make regexes stateful
const v46Exact = new RegExp(`(?:^${v4}$)|(?:^${v6}$)`)
const v4exact = new RegExp(`^${v4}$`)
const v6exact = new RegExp(`^${v6}$`)

/**
 * Regular expression for matching IP addresses.
 * @returns A regex for matching both IPv4 and IPv6.
 * @example
 * ```
 * import ipRegex from 'ip-regex';
 * // Contains an IP address?
 * ipRegex().test('unicorn 192.168.0.1');
 * //=> true
 * // Is an IP address?
 * ipRegex({exact: true}).test('unicorn 192.168.0.1');
 * //=> false
 * 'unicorn 192.168.0.1 cake 1:2:3:4:5:6:7:8 rainbow'.match(ipRegex());
 * //=> ['192.168.0.1', '1:2:3:4:5:6:7:8']
 * // Contains an IP address?
 * ipRegex({includeBoundaries: true}).test('192.168.0.2000000000');
 * //=> false
 * // Matches an IP address?
 * '192.168.0.2000000000'.match(ipRegex({includeBoundaries: true}));
 * //=> null
 * ```
 */
const ipRegex = (options?: Options): RegExp =>
  options && options.exact
    ? v46Exact
    : new RegExp(`(?:${boundry(options)}${v4}${boundry(options)})|(?:${boundry(options)}${v6}${boundry(options)})`, 'g')

/**
 * @returns A regex for matching IPv4.
 */
ipRegex.v4 = (options?: Options): RegExp =>
  options && options.exact ? v4exact : new RegExp(`${boundry(options)}${v4}${boundry(options)}`, 'g')

/**
 * @returns A regex for matching IPv6.
 * @example
 * ```
 * import ipRegex from 'ip-regex';
 * ipRegex.v6({exact: true}).test('1:2:3:4:5:6:7:8');
 * //=> true
 * ```
 */
ipRegex.v6 = (options?: Options): RegExp =>
  options && options.exact ? v6exact : new RegExp(`${boundry(options)}${v6}${boundry(options)}`, 'g')

export { ipRegex }

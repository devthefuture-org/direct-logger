# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.5.1](https://github.com/devthejo/direct-logger/compare/v2.5.0...v2.5.1) (2023-01-14)


### Bug Fixes

* remove trim for cli formatter ([a1a2072](https://github.com/devthejo/direct-logger/commit/a1a207215b78f640606f1ed14fc51ebb7da3d315))

## [2.2.0](https://github.com/devthejo/direct-logger/compare/v2.1.0...v2.2.0) (2022-12-11)


### Features

* minLevel + maxLevel ([a33f846](https://github.com/devthejo/direct-logger/commit/a33f846619433dddd643c198a9f9f138de09dabd))


### Bug Fixes

* delivery script ([b9c84e8](https://github.com/devthejo/direct-logger/commit/b9c84e8344094f07c5f8ac94d63c4bdcbe5395d1))
* improve formatters and cli ([77706c8](https://github.com/devthejo/direct-logger/commit/77706c82f42574182ace0895b468b39fa2861bb0))
* lint ([01dee89](https://github.com/devthejo/direct-logger/commit/01dee8937409dd9fbb56418e459d979d75f41dd6))

## [2.1.0](https://github.com/devthejo/direct-logger/compare/v2.0.0...v2.1.0) (2022-12-09)


### Features

* interop pino: default + reversible arguments ([9342a2c](https://github.com/devthejo/direct-logger/commit/9342a2cba5208b2b4311bfc85e987e8bf2ba754a))


### Bug Fixes

* level order ([d752b03](https://github.com/devthejo/direct-logger/commit/d752b035b7adfce54249a489830436423864a2eb))
* reversible arguments ([6edc6dc](https://github.com/devthejo/direct-logger/commit/6edc6dc83b6f002a76e6f7660a8377f8f64e1382))
* tests ([e5bedbc](https://github.com/devthejo/direct-logger/commit/e5bedbc10b53256fbf7d7a69eeb2aef6dbee320c))

## 2.0.0 (2022-12-09)


### ⚠ BREAKING CHANGES

* Always pass an error to the formatter no matter the
level
* using let/const drops support for old environments

### Features

* child logger ([84d27c4](https://github.com/devthejo/direct-logger/commit/84d27c4072c9576d5cde5ccab9217890e2ecb0dc))
* cli logger no supports colors:false ([5bd9ff5](https://github.com/devthejo/direct-logger/commit/5bd9ff5477331361a5a322d0c03ab6619789ccf8))
* **cli:** clean up multi-line error display ([ceee0ac](https://github.com/devthejo/direct-logger/commit/ceee0ac99be02aae4cc31cf6e134a7c7f5b50c70))
* dim and trim ([c269d3b](https://github.com/devthejo/direct-logger/commit/c269d3b635dbdf498c42482dedd81e5493b31162))
* export an instance and the constructor BREAKING CHANGE ([bc6646b](https://github.com/devthejo/direct-logger/commit/bc6646bcdcd1e6027d114e19c5b7b27e59950e15))
* lazy init error instance ([4e41ce7](https://github.com/devthejo/direct-logger/commit/4e41ce79d63148d4ad4090abf2d16cdc060c5a00))
* log error properties as extra data ([c7f64ca](https://github.com/devthejo/direct-logger/commit/c7f64caf1cf2dcef5cbd0ed1f59dfca92f55717c))
* make levels configurable ([a0d6034](https://github.com/devthejo/direct-logger/commit/a0d6034890593928b709405713fdffc37c88c940))
* secrets ([e05ac37](https://github.com/devthejo/direct-logger/commit/e05ac3701f6f6dbd5aabf3be0eed8860ae85d892))


### Bug Fixes

* **build:** ci fixes, added node versions, updated badges and docs, and added standard-version ([dd34b0f](https://github.com/devthejo/direct-logger/commit/dd34b0fefc96ca4c06d0b0dfa6c88af69ca3ec5d))
* clean yarn.lock ([8ce6f7b](https://github.com/devthejo/direct-logger/commit/8ce6f7b87f253e6b9f2bd6ecb2fcbf958f570a44))
* node@6 was never supposed to be supported in 3.x ([0df26b6](https://github.com/devthejo/direct-logger/commit/0df26b644b2208c176b12339b7278300dd67458d))
* only capture stack if passed an error ([3e3ca5a](https://github.com/devthejo/direct-logger/commit/3e3ca5a501f881332f7e71d99dca12fc278e75ff))
* rename to Logger ([d061b0e](https://github.com/devthejo/direct-logger/commit/d061b0ee403f4052d61bf7258df4b421efd9e2df))
* test in 8 & 12; var to let/const ([b835296](https://github.com/devthejo/direct-logger/commit/b835296a3ba0100bf63f18094cade3b3014eedb6))
* up workspace and stack ([c72d2a8](https://github.com/devthejo/direct-logger/commit/c72d2a8ab43acd7dfe803dd8fb1713bdbb2291a1))


* feat (formatter): Improved cli formatter ([4861850](https://github.com/devthejo/direct-logger/commit/4861850cc0f47f5363b115bb4115a15a41ba7802))

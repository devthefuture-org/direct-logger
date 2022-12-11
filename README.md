# direct-logger

## based on https://github.com/wesleytodd/loggerr

Logger call API is interoperable with pino logger.

**Features:**

- Synchronous output (great for cli's, browser and tools)
- Levels (built-in and customizable)
- Formatting (built-in and customizable)
- `direct-logger` is dependency free (*formatters are not*)
- Always captures stack trace on error logs
- Tiny filesize
- The `cli` formatter 🚀

## Install

```
$ yarn add direct-logger
```

## Usage

```javascript
const { Logger } = require('direct-logger')
const logger = Logger()

logger.error(new Error('My error message'))
// Thu Apr 16 2015 22:05:27 GMT-0500 (CDT) [error] - {"msg":"Error: My error message\n<STACK TRACE>"}

logger.info('Something happened', {
  foo: 'info about what happened'
})
// Thu Apr 16 2015 22:05:27 GMT-0500 (CDT) [info] - {"msg":"Something happened","foo":"info about what happened"}
```

## Log Levels

Each log level can be directed to a different output stream
or disabled entirely. The default levels are as follows:

- `fatal`
- `error`
- `warn` *(default)*
- `info`
- `debug`
- `trace`

Constants are available for setting and referencing the levels and
their streams. These constants are the all uppercase version of the
level.  Here is an example of setting the log level:

```javascript
const logger = Logger({
  level: Logger.DEBUG
})

logger.debug('Foo')
// Thu Apr 16 2015 22:05:27 GMT-0500 (CDT) [debug] - {"msg":"Foo"}
```

### Customize Levels

You can fully customize the levels for your purposes. For example, here
we implement `pino` compatible levels:

```javascript
const log = Logger({
  level: [ 'trace', 'debug', 'info', 'warn', 'error', 'fatal' ]
})

log.trace('Example trace log')
```

## Log Formatting

direct-logger supports formatting via formatter functions. The default
formatter outputs a timestamp, the log level and the messages formatted
as json. But you can provide a custom formatter function with the `formatter`
options. Formatter functions take three parameters: `date`, `level`, `data`.
Say we want to output the log message with a color based on the level:

```javascript
const Logger = require('direct-logger')
const chalk = require('chalk')

const logger = Logger({
  formatter: (date, level, data) => {
    var color
    switch (Logger.levels.indexOf(level)) {
      case Logger.FATAL:
      case Logger.ERROR:
        color = chalk.red
        break
      case Logger.WARN:
        color = chalk.yellow
        break
      case Logger.INFO:
      case Logger.DEBUG:
        color = chalk.white
        break
    }
    return color(data.msg)
  }
})
```

There are a few built-in in formatters:

- `default`: Outputs date, level and json
- `cli`: Outputs the message and json data, colorized and formatted
- `bunyan`: Compatible format to `bunyan`
- `browser`: Relies on `console.log`, so just returns the `data`

For these built-in formatters can specify the string name of the formatter for built-in formatters:

```javascript
const log = Logger({
  formatter: 'cli'
})
```

To use the cli formatter you can require it and pass the `formatter` options:

```javascript
const log = Logger({
  formatter: require('direct-logger/formatters/cli')
})
```

## Output Streams

You can output each level to it's own stream. The method is simple, just pass an
array of streams corresponding to each level as the `streams` option. The simplest
way is to just map over `Logger.levels`, this is how we set the defaults:

```javascript
Logger({
  streams: Logger.levels.map(function (level, i) {
    return i > Logger.WARN ? process.stdin : process.stderr
  })
})
```

The most useful reason to specify an output stream to to redirect logs to files.
Here is an example of how to do that:

```javascript
const logfile = fs.createWriteStream('./logs/stdout.log', {
  flags: 'a',
  encoding: 'utf8'
})

Logger({
  streams: Logger.levels.map(() => logfile)
})
```

## Redact secrets

```javascript
const logger = Logger({
  secrets: ["1234"],
  secretsHideCharsCount: false, // default false
  secretsStringSubstition: "***", // used when secretsHideCharsCount is true
  secretsRepeatCharSubstition: "*", // used when secretsHideCharsCount is false
})

logger.info("secret is 123454678") // output "secret is ****5678"

logger.addSecret("5678")
logger.secretsHideCharsCount = true
logger.info("secret is 123454678") // output "secret is ***"

logger.deleteSecret("1234")
logger.info("secret is 123454678") // output "secret is 1234***"

const hasSecret = logger.hasSecret("54678") // hasSecret === true
```

## Arguments order

Arguments orders are reversible.

```javascript
// classical
logger.debug("Hello world !", { foo: "bar" })

// pino compatible
logger.debug({ foo: "bar" }, "Hello world !")

// string message can be replaced by object having a `toString` method
logger.debug({ foo: "bar" }, new Error("Here is a message"))
logger.debug(new Error("Here is another message"), { foo: "bar" })
```

## Set Level

```javascript
logger.setLevel("warn")
logger.minLevel("debug")
logger.maxLevel("info")
```
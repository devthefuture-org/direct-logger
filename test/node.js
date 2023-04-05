const { describe, it, before, after } = require('mocha')
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Logger = require('../').Logger
const logdir = path.join(__dirname, 'log')

describe('Logger - node specific', function () {
  before(function () {
    try {
      fs.mkdirSync(logdir)
    } catch (e) {}
  })
  after(function () {
    fs.rmdirSync(logdir)
  })

  it('should log error level messages with a stack trace', function (done) {
    const logger = new Logger({
      level: Logger.ERROR,
      streams: Logger.levels.map(() => ({
        write: (chunk) => {
          assert.notStrictEqual(chunk.indexOf('Error: foobar'), -1)
          assert.notStrictEqual(chunk.indexOf('direct-logger/test/node.js:'), -1)
          done()
        }
      }))
    })
    logger.error('foobar')
  })

  it('should log to a file', function (done) {
    const logfile = path.join(logdir, 'file.log')
    const file = fs.createWriteStream(logfile, {
      flags: 'a',
      encoding: 'utf8'
    })

    const logger = new Logger({
      streams: Logger.levels.map(function () {
        return file
      }),
      level: Logger.ERROR
    })
    logger.error('foo', async function () {
      await logger.end()
      const c = fs.readFileSync(logfile, { encoding: 'utf-8' })
      assert.notStrictEqual(c.indexOf('foo'), -1)
      fs.unlinkSync(logfile)
      done()
    })
  })

  it('should log to multiple files', function (done) {
    const errfile = path.join(logdir, 'err.log')
    const outfile = path.join(logdir, 'out.log')

    const err = fs.createWriteStream(errfile, {
      flags: 'a',
      encoding: 'utf8'
    })
    const out = fs.createWriteStream(outfile, {
      flags: 'a',
      encoding: 'utf8'
    })

    const logger = new Logger({
      streams: Logger.levels.map(function (level, i) {
        return i <= Logger.ERROR ? err : out
      }),
      level: Logger.WARN
    })

    logger.error('foo', function () {
      logger.warn('bar', async function () {
        await logger.end()
        const ec = fs.readFileSync(errfile, { encoding: 'utf-8' })
        const oc = fs.readFileSync(outfile, { encoding: 'utf-8' })

        assert.notStrictEqual(ec.indexOf('error'), -1)
        assert.strictEqual(ec.indexOf('warn'), -1)
        assert.notStrictEqual(ec.indexOf('foo'), -1)

        assert.notStrictEqual(oc.indexOf('warn'), -1)
        assert.strictEqual(oc.indexOf('error'), -1)
        assert.notStrictEqual(oc.indexOf('bar'), -1)

        fs.unlinkSync(errfile)
        fs.unlinkSync(outfile)
        done()
      })
    })
  })

  it('should load a named formatter', function (done) {
    Logger({
      level: Logger.INFO,
      streams: Logger.levels.map(() => ({
        write: (chunk) => {
          assert.strictEqual(JSON.parse(chunk).msg, 'Foo Bar')
          done()
        }
      })),
      formatter: 'bunyan'
    }).error('Foo Bar', { code: 'test' })
  })
})

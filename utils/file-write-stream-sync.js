const fs = require('fs');
const { Writable } = require('node:stream');

class FileWriteStreamSync extends Writable {
  constructor(file){
    super()
    this.fd = fs.openSync(file, 'w');
  }
  _write(data, _enc, cb){
    fs.writeSync(this.fd, data);
    if(typeof cb === 'function'){
      cb()
    }
  }
  _destroy(err, callback) {
    if (this.fd) {
      fs.close(this.fd, (er) => callback(er || err));
    } else {
      callback(err);
    }
  }
}

module.exports = (...args) => new FileWriteStreamSync(...args)
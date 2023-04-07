module.exports = (e) => {
  return e.stack ? e.stack : e.toString()
}

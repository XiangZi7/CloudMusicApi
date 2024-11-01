const createOption = (query, crypto = '', isDiy) => {
  return {
    crypto: query.crypto || crypto || '',
    cookie: query.cookie,
    ua: query.ua || '',
    proxy: query.proxy,
    realIP: query.realIP,
    e_r: query.e_r || undefined,
    isDiy,
  }
}
module.exports = createOption

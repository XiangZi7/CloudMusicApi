const scrapers = require('../animation_module/playbackScraper')

module.exports = async (query) => {
  let result
  switch (query.type) {
    case 'xfani':
      result = await scrapers.xfani(query.id)
      break
    case 'nnyy':
      result = await scrapers.nnyy(query)
      break
    default:
      result = { body: 'Unknown scraper type', status: 400 }
      break
  }

  // 返回结果
  return result
}

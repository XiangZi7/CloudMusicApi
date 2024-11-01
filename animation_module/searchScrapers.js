const { createAxiosInstance, createResponse } = require('./utils') // 导入工具函数
const cheerio = require('cheerio')

const searchScrapers = {
  // 稀饭动漫搜索
  async xfani(query) {
    const kw = query.kw
    const page = query.page
      ? `/search/wd/${kw}/page/${query.page}.html`
      : `/search.html?wd=${kw}`
    const url = `https://dick.xfani.com${page}`
    const result = []

    try {
      const axiosInstance = createAxiosInstance(true) // 创建支持代理的 axios 实例
      console.log(`Fetching data from: ${url}`)
      const response = await axiosInstance.get(url)
      const $ = cheerio.load(response.data)

      // 提取搜索结果
      $('.public-list-box').each((index, element) => {
        const imgSrc = $(element).find('img[data-src]').attr('data-src')
        const title = $(element).find('.thumb-txt').text().trim()
        const detailLink = $(element).find('.public-list-exp').attr('href')
        const description = $(element).find('.thumb-blurb').text().trim()

        // 提取 ID
        const idMatch = detailLink.match(/\/bangumi\/(\d+)\.html/)
        const id = idMatch ? Number(idMatch[1]) : null

        result.push({ title, img: imgSrc, description, id })
      })

      return createResponse(result) // 返回结果
    } catch (error) {
      console.error('Error fetching data:', error.message)
      return createResponse('Error fetching data', 500) // 处理错误并返回
    }
  },

  // 从 Nnyy 获取搜索结果
  async nnyy(query) {
    const kw = query.kw
    const url = `https://nnyy.in/so?q=${encodeURIComponent(kw)}`
    const result = []

    try {
      const axiosInstance = createAxiosInstance(true) // 创建支持代理的 axios 实例
      console.log(`Fetching data from: ${url}`)
      const response = await axiosInstance.get(url)
      const $ = cheerio.load(response.data)

      // 提取搜索结果
      $('.lists-content ul li').each((index, element) => {
        const imgSrc = $(element).find('img.thumb').attr('src')
        const title = $(element).find('h2 a').text().trim()
        const detailLink = $(element).find('img.thumb').attr('src')
        const description = $(element).find('.note span').text().trim()

        const year = $(element)
          .find('.countrie span.orange')
          .eq(0)
          .text()
          .trim()
        const country = $(element)
          .find('.countrie span.orange')
          .eq(1)
          .text()
          .trim()
        const rate = $(element).find('.rate').text().trim()

        // 提取 ID
        const idMatch = detailLink.match(/\/nnimg2\/(\d+)\.jpg/)
        const id = idMatch ? Number(idMatch[1]) : null

        result.push({
          title,
          img: 'https://nnyy.in' + imgSrc,
          description,
          year,
          country,
          rate,
          id,
        })
      })

      return createResponse(result) // 返回结果
    } catch (error) {
      console.error('Error fetching data from Nnyy:', error.message)
      return createResponse('Error fetching data from Nnyy', 500) // 处理错误并返回
    }
  },
}

// 导出爬虫接口
module.exports = searchScrapers

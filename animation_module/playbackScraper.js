const { createAxiosInstance, createResponse } = require('./utils') // 导入工具函数
const cheerio = require('cheerio')
const axios = require('axios')

const playbackScraper = {
  // 获取播放详情和集数
  async xfani(id) {
    const url = `https://dick.xfani.com/watch/${id}/1/1.html` // 根据提供的 ID 生成 URL
    const result = { id, episodes: [], playerUrls: [], videoSrc: null }

    try {
      const proxy = { host: '117.42.94.58', port: 21886 } // 代理设置
      const axiosInstance = createAxiosInstance(true) // 创建支持代理的 axios 实例

      console.log(`Fetching playback details from: ${url}`)
      const response = await axiosInstance.get(url, { proxy }) // 获取页面数据

      const $ = cheerio.load(response.data) // 加载 HTML 数据

      // 提取视频源地址
      const videoSrc = $('video.art-video').attr('src')
      if (videoSrc) {
        result.videoSrc = videoSrc // 存储视频资源地址
      }

      // 提取播放地址
      $('.swiper-wrapper .vod-playerUrl').each((index, element) => {
        const title = $(element).text().trim() // 获取标题
        const form = $(element).data('form') // 获取表单数据
        result.playerUrls.push({ title, form }) // 存储播放地址
      })

      // 提取集数列表
      $('#play2 .anthology-list-play a').each((index, element) => {
        const episodeLink = $(element).attr('href') // 获取集数链接
        const episodeTitle = $(element).find('span').text().trim() // 获取集数标题
        const episodeIdMatch = episodeLink.match(
          /\/watch\/(\d+)\/(\d+)\/(\d+)\.html/,
        )
        const episodeId = episodeIdMatch ? episodeIdMatch[0] : null // 正则匹配集数 ID

        result.episodes.push({
          title: episodeTitle,
          link: episodeLink,
          id: episodeId,
        })
      })

      return createResponse(result) // 返回结果
    } catch (error) {
      console.error('Error fetching playback details:', error.message)
      return createResponse('Error fetching playback details', 500) // 处理错误并返回
    }
  },

  // 从努努影院获取详情
  // 从 Nnyy 获取搜索结果
  // 从 Nnyy 获取搜索结果
  async nnyy(query) {
    const ep = query.ep || 'ep' + 1 // 如果 query.ep 假，则默认为 1
    const detailUrl = `https://nnyy.in/_gp/${query.id}/${ep}` // 用于获取具体集数的数据
    const playlistUrl = `https://nnyy.in/dongman/${query.id}.html` // 用于获取所有集数的信息
    const infoUrl = `https://nnyy.in/dongman/${query.id}.html` // 用于获取详情信息

    try {
      const axiosInstance = createAxiosInstance(true) // 创建支持代理的 axios 实例

      // 第一步：获取具体集数的信息
      const detailResponse = await axiosInstance.get(detailUrl)
      const detailData = detailResponse.data // 获取详细信息

      // 第二步：获取集数信息
      const playlistResponse = await axiosInstance.get(playlistUrl)
      const $ = cheerio.load(playlistResponse.data)
      const totalEpisodes = [] // 用于存储集数信息

      // 提取集数信息
      $('.playlist #eps-ul li').each((index, element) => {
        const episodeSlug = $(element).attr('ep_slug')
        const episodeTitle = $(element).text().trim()
        totalEpisodes.push({ slug: episodeSlug, title: episodeTitle })
      })

      // 第三步：获取详细信息
      const infoResponse = await axiosInstance.get(infoUrl)
      const info$ = cheerio.load(infoResponse.data)
      const title = info$('.product-title').text().trim() // 提取标题
      const rate = info$('.rate').text().trim() // 提取评分
      const director = info$('.product-excerpt')
        .eq(0)
        .find('span')
        .text()
        .trim() // 提取导演
      const cast = info$('.product-excerpt').eq(1).find('span').text().trim() // 提取主演
      const genre = info$('.product-excerpt').eq(2).find('span').text().trim() // 提取类型
      const country = info$('.product-excerpt').eq(3).find('span').text().trim() // 提取制片国家
      const alias = info$('.product-excerpt').eq(4).find('span').text().trim() // 提取又名
      const synopsis = info$('.product-excerpt')
        .eq(5)
        .find('span')
        .text()
        .trim() // 提取剧情简介

      // 准备返回结果
      const detailedInfo = {
        title,
        rate,
        director,
        cast,
        genre,
        country,
        alias,
        synopsis,
      }

      // 返回消息
      return createResponse({
        detailInfo: detailData, // 原始详细数据
        totalEpisodes: totalEpisodes, // 所有集数的信息
        detailedInfo: detailedInfo, // 获取的详细信息
      })
    } catch (error) {
      console.error('Error fetching details from nnyy:', error.message)
      return createResponse('Error fetching playback details', 500) // 处理错误并返回
    }
  },
}

// 导出播放爬虫模块
module.exports = playbackScraper

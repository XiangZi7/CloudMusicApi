const axios = require('axios')
const https = require('https')

// 配置 axios 实例
const createAxiosInstance = (allowUnauthorized = false) => {
  return axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: allowUnauthorized }),
  })
}

// 创建统一的响应格式
const createResponse = (data, code = 200) => {
  return { body: { data, code }, status: code }
}

// 导出工具函数
module.exports = { createAxiosInstance, createResponse }

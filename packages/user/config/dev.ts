import type { UserConfigExport } from "@tarojs/cli"

export default {
  
  mini: {},
  h5: {
    devServer: {
    proxy: {
      // 仅匹配 /api 或 /api/xxx，不匹配 /apiSomething 或 /apiXxx.js
      '^/api(/|$)': {
        target: 'http://10.147.17.1:8080',
        changeOrigin: true,
        secure: false,
        // 加一个安全兜底：不要代理前端源码文件
        bypass(req) {
          if (/\.(js|ts|tsx|css|map|json)$/.test(req.url)) {
            return req.url; // 返回原路径，不走代理
          }
        }
      }
    }

    }
  }
} satisfies UserConfigExport<'vite'>

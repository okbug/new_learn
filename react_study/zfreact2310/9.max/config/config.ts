import { defineConfig } from "@umijs/max";
import routes from "./routes";
export default defineConfig({
  npmClient: "npm", //指定npm客户端工具
  routes, //配置式路由配置
  styledComponents: {}, //启动styled-component样式支持
  antd: {},
  tailwindcss: {},
  layout: {
    title: 'UMI-MAX',
  },
  request: {//启用内置的请求插件
    dataField: 'data'//提取响应中的data字段
  },
  model:{},//启用内置的数据流方案
  access: {},//启动权限插件
  initialState:{},//启用初初始状态插件
  proxy:{//配置代理，当调用接口的时候如果请求的路径是以/api/开头的，则转发到7001后台服务端上
    '/api/':{
      target:'http://127.0.0.1:7001',
      changeOrigin:true
    }
  }
});

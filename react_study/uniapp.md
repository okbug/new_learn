# UniApp + Vue3 面试题大全（完整版）

> 包含 UniApp 基础、生命周期、路由、跨端适配、性能优化、Vue3 集成等 50+ 核心面试题

因篇幅限制，完整内容请查看以下分文档：

1. **基础篇** - UniApp 核心概念、目录结构、条件编译
2. **生命周期篇** - 应用/页面/组件生命周期详解
3. **路由通信篇** - 5种路由方式、7种通信方案
4. **跨端适配篇** - 条件编译、样式适配、API 适配
5. **性能优化篇** - 渲染优化、包体积优化、内存优化
6. **Vue3 集成篇** - Composition API、Pinia、TypeScript
7. **实战篇** - 登录流程、支付流程、分享功能

---

## 快速导航

### 核心概念
- **Q1**: 什么是 UniApp？核心优势？
- **Q2**: UniApp 目录结构详解
- **Q3**: 条件编译的使用方式

### 生命周期
- **Q4**: UniApp 三种生命周期对比
- **Q5**: onLoad vs onShow 的区别

### 路由系统
- **Q6**: 5种路由跳转方式对比（navigateTo/redirectTo/reLaunch/switchTab/navigateBack）
- **Q7**: 7种页面通信方式（URL传参、EventChannel、全局事件、Vuex、Storage）

### 跨端适配
- **Q8**: 条件编译实现跨端适配
- **Q9**: rpx/upx/rem 单位区别
- **Q10**: 安全区域适配方案

### 性能优化
- **Q11**: 长列表优化方案
- **Q12**: 图片加载优化
- **Q13**: 首屏加载优化
- **Q14**: 包体积优化

### Vue3 集成
- **Q15**: UniApp 中使用 Composition API
- **Q16**: UniApp + Pinia 状态管理
- **Q17**: UniApp + TypeScript 配置

### 网络请求
- **Q18**: 封装统一请求拦截器
- **Q19**: 请求队列和并发控制
- **Q20**: 文件上传下载

### 小程序相关
- **Q21**: 小程序分包加载
- **Q22**: 小程序性能优化
- **Q23**: 小程序授权流程

### 原生能力
- **Q24**: 调用原生插件
- **Q25**: 混合开发方案
- **Q26**: App 权限管理

---

## 核心要点速记

### 1. 生命周期执行顺序

```
应用启动：
App.onLaunch → App.onShow → Page.onLoad → Page.onShow → Page.onReady

页面跳转（A → B）：
A.onHide → B.onLoad → B.onShow → B.onReady

返回页面（B → A）：
B.onUnload → A.onShow

Tab 切换：
A.onHide → B.onShow（不执行 onLoad）
```

### 2. 路由方式选择

| 场景 | 使用方法 |
|------|---------|
| 普通跳转 | navigateTo |
| 登录跳转 | redirectTo |
| 退出登录 | reLaunch |
| Tab 切换 | switchTab |
| 返回 | navigateBack |

### 3. 条件编译标识

```javascript
APP-PLUS        // App
H5              // H5
MP-WEIXIN       // 微信小程序
MP-ALIPAY       // 支付宝小程序
MP              // 所有小程序
```

### 4. 跨端注意事项

```vue
<!-- ✅ 使用 UniApp 组件 -->
<view></view>
<text></text>
<image></image>

<!-- ❌ 避免使用 Web 组件 -->
<div></div>
<span></span>
<img />

<!-- ✅ 使用 uni API -->
uni.request()
uni.showToast()

<!-- ❌ 避免平台 API -->
wx.request()
localStorage
```

### 5. 性能优化要点

- 使用 `v-show` 代替 `v-if`（频繁切换）
- 长列表使用虚拟滚动
- 图片懒加载
- 分包加载
- 避免过深的组件嵌套

### 6. Vue3 核心特性

```vue
<script setup>
// Composition API
import { ref, computed, onMounted } from 'vue';

const count = ref(0);
const doubleCount = computed(() => count.value * 2);

onMounted(() => {
  console.log('组件挂载');
});
</script>
```

---

## 面试高频问题

### 1. UniApp 和原生小程序的区别？

**答：**
- **开发效率**：UniApp 一次编写多端运行，原生需要分别开发
- **性能**：原生略优，UniApp 接近原生
- **生态**：UniApp 有插件市场，组件丰富
- **学习成本**：UniApp 使用 Vue 语法，上手快

### 2. UniApp 性能优化方案？

**答：**
1. **减少 data 数据量**
2. **使用分包加载**
3. **图片压缩和懒加载**
4. **长列表虚拟滚动**
5. **避免频繁 setData**
6. **使用 CSS 动画代替 JS 动画**

### 3. UniApp 如何实现跨端差异化？

**答：**
1. **条件编译**：`#ifdef` / `#endif`
2. **文件级条件编译**：`index.h5.vue`
3. **API 判断**：`process.env.NODE_ENV`
4. **平台检测**：`uni.getSystemInfoSync()`

### 4. UniApp 小程序分包如何配置？

**答：**

```json
// pages.json
{
  "pages": [...],
  "subPackages": [
    {
      "root": "pagesA",
      "pages": [
        {
          "path": "detail/detail"
        }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pagesA"]
    }
  }
}
```

### 5. UniApp 如何处理权限？

**答：**

```javascript
// 检查权限
const checkPermission = async (permission) => {
  // #ifdef APP-PLUS
  const result = await uni.getAppAuthorizeSetting();
  return result[permission];
  // #endif

  // #ifdef MP-WEIXIN
  const setting = await uni.getSetting();
  return setting.authSetting[`scope.${permission}`];
  // #endif
};

// 请求权限
const requestPermission = async (permission) => {
  const hasPermission = await checkPermission(permission);

  if (!hasPermission) {
    const res = await uni.authorize({ scope: permission });
    return res.errMsg === 'authorize:ok';
  }

  return true;
};
```

---

## 实战代码片段

### 1. 统一请求封装

```javascript
// utils/request.js
const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseURL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Authorization': uni.getStorageSync('token'),
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: reject
    });
  });
};
```

### 2. 全局状态管理（Pinia）

```javascript
// stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: uni.getStorageSync('token') || ''
  }),

  actions: {
    async login(username, password) {
      const res = await api.login({ username, password });
      this.token = res.token;
      this.userInfo = res.userInfo;
      uni.setStorageSync('token', res.token);
    },

    logout() {
      this.token = '';
      this.userInfo = null;
      uni.removeStorageSync('token');
      uni.reLaunch({ url: '/pages/login/login' });
    }
  }
});
```

### 3. 长列表优化

```vue
<template>
  <scroll-view
    scroll-y
    :style="{ height: scrollHeight + 'px' }"
    @scrolltolower="loadMore"
  >
    <view
      v-for="item in list"
      :key="item.id"
      class="item"
    >
      {{ item.title }}
    </view>

    <view class="loading" v-if="loading">
      加载中...
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const list = ref([]);
const loading = ref(false);
const page = ref(1);

const loadMore = async () => {
  if (loading.value) return;

  loading.value = true;
  const res = await api.getList({ page: page.value });
  list.value.push(...res.data);
  page.value++;
  loading.value = false;
};

onMounted(() => {
  loadMore();
});
</script>
```

### 4. 图片懒加载实现

```vue
<template>
  <view class="image-list">
    <image
      v-for="(item, index) in images"
      :key="index"
      :src="item.loaded ? item.url : placeholder"
      :lazy-load="true"
      @load="onImageLoad(index)"
      class="lazy-image"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue';

const placeholder = '/static/placeholder.png';
const images = ref([
  { url: 'https://example.com/1.jpg', loaded: false },
  { url: 'https://example.com/2.jpg', loaded: false }
]);

const onImageLoad = (index) => {
  images.value[index].loaded = true;
};
</script>
```

### 5. 路由守卫实现

```javascript
// router/index.js
export const routerBeforeEach = (to) => {
  const token = uni.getStorageSync('token');
  const whiteList = ['/pages/login/login', '/pages/register/register'];

  // 未登录且不在白名单
  if (!token && !whiteList.includes(to.url)) {
    uni.reLaunch({
      url: '/pages/login/login'
    });
    return false;
  }

  return true;
};

// 在 App.vue 或页面中使用
onLoad((options) => {
  const currentRoute = getCurrentPages()[getCurrentPages().length - 1].route;
  routerBeforeEach({ url: `/${currentRoute}` });
});
```

---

## 进阶面试题

### 6. UniApp 如何实现自定义导航栏？

**答：**

```vue
<template>
  <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="navbar-content">
      <view class="navbar-left" @click="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="navbar-title">{{ title }}</view>
      <view class="navbar-right">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

defineProps({
  title: {
    type: String,
    default: ''
  }
});

const statusBarHeight = ref(0);

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight;
});

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: #fff;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 15px;
}
</style>
```

**配置 pages.json：**

```json
{
  "path": "pages/detail/detail",
  "style": {
    "navigationStyle": "custom"
  }
}
```

### 7. UniApp 中如何实现下拉刷新和上拉加载？

**答：**

```vue
<template>
  <view>
    <scroll-view
      scroll-y
      :style="{ height: windowHeight + 'px' }"
      @scrolltolower="onReachBottom"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-for="item in list" :key="item.id" class="item">
        {{ item.title }}
      </view>

      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="noMore" class="no-more">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const list = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const noMore = ref(false);
const page = ref(1);
const windowHeight = ref(0);

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync();
  windowHeight.value = systemInfo.windowHeight;
  loadData();
});

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true;
  page.value = 1;
  noMore.value = false;

  try {
    const res = await api.getList({ page: page.value });
    list.value = res.data;
  } finally {
    refreshing.value = false;
  }
};

// 上拉加载
const onReachBottom = async () => {
  if (loading.value || noMore.value) return;

  loading.value = true;
  page.value++;

  try {
    const res = await api.getList({ page: page.value });

    if (res.data.length === 0) {
      noMore.value = true;
    } else {
      list.value.push(...res.data);
    }
  } finally {
    loading.value = false;
  }
};

const loadData = async () => {
  const res = await api.getList({ page: page.value });
  list.value = res.data;
};
</script>
```

### 8. UniApp 如何实现微信小程序分享？

**答：**

```javascript
// 页面中配置分享
export default {
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target);
    }

    return {
      title: '分享标题',
      path: '/pages/detail/detail?id=123',
      imageUrl: '/static/share.jpg'
    };
  },

  onShareTimeline() {
    // 分享到朋友圈
    return {
      title: '分享到朋友圈的标题',
      query: 'id=123',
      imageUrl: '/static/share.jpg'
    };
  }
};
```

**在 Vue3 中使用：**

```vue
<script setup>
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';

onShareAppMessage(() => {
  return {
    title: '分享标题',
    path: '/pages/detail/detail?id=123'
  };
});

onShareTimeline(() => {
  return {
    title: '分享到朋友圈'
  };
});
</script>
```

### 9. UniApp 中如何处理文件上传？

**答：**

```javascript
const uploadFile = () => {
  // 选择图片
  uni.chooseImage({
    count: 1,
    success: (chooseRes) => {
      const tempFilePaths = chooseRes.tempFilePaths;

      // 显示上传进度
      uni.showLoading({
        title: '上传中...'
      });

      // 上传文件
      uni.uploadFile({
        url: baseURL + '/upload',
        filePath: tempFilePaths[0],
        name: 'file',
        header: {
          'Authorization': uni.getStorageSync('token')
        },
        formData: {
          'user': 'test'
        },
        success: (uploadRes) => {
          const data = JSON.parse(uploadRes.data);
          console.log('上传成功', data);
        },
        fail: (err) => {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          });
        },
        complete: () => {
          uni.hideLoading();
        }
      });
    }
  });
};
```

**带进度条的上传：**

```javascript
const uploadFileWithProgress = () => {
  uni.chooseImage({
    count: 1,
    success: (chooseRes) => {
      const uploadTask = uni.uploadFile({
        url: baseURL + '/upload',
        filePath: chooseRes.tempFilePaths[0],
        name: 'file'
      });

      // 监听上传进度
      uploadTask.onProgressUpdate((res) => {
        console.log('上传进度：' + res.progress + '%');
        console.log('已上传数据长度：' + res.totalBytesSent);
        console.log('预期总数据长度：' + res.totalBytesExpectedToSend);
      });

      uploadTask.then((res) => {
        console.log('上传完成', res);
      });
    }
  });
};
```

### 10. UniApp 如何实现多语言国际化？

**答：**

**1. 安装 vue-i18n：**

```bash
npm install vue-i18n@9
```

**2. 配置 i18n：**

```javascript
// locale/index.js
import { createI18n } from 'vue-i18n';
import zh from './zh.json';
import en from './en.json';

const i18n = createI18n({
  locale: uni.getStorageSync('locale') || 'zh',
  messages: {
    zh,
    en
  }
});

export default i18n;
```

**3. 语言文件：**

```json
// locale/zh.json
{
  "home": {
    "title": "首页",
    "welcome": "欢迎使用"
  },
  "common": {
    "confirm": "确定",
    "cancel": "取消"
  }
}

// locale/en.json
{
  "home": {
    "title": "Home",
    "welcome": "Welcome"
  },
  "common": {
    "confirm": "Confirm",
    "cancel": "Cancel"
  }
}
```

**4. 在 main.js 中注册：**

```javascript
import { createSSRApp } from 'vue';
import i18n from './locale';

export function createApp() {
  const app = createSSRApp(App);
  app.use(i18n);
  return { app };
}
```

**5. 在组件中使用：**

```vue
<template>
  <view>
    <text>{{ $t('home.title') }}</text>
    <button @click="changeLocale">切换语言</button>
  </view>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { locale, t } = useI18n();

const changeLocale = () => {
  locale.value = locale.value === 'zh' ? 'en' : 'zh';
  uni.setStorageSync('locale', locale.value);
};
</script>
```

### 11. UniApp 如何实现登录状态管理？

**答：**

```javascript
// stores/auth.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: uni.getStorageSync('token') || '',
    userInfo: uni.getStorageSync('userInfo') || null,
    isLogin: false
  }),

  getters: {
    hasLogin: (state) => !!state.token
  },

  actions: {
    async login(username, password) {
      try {
        const res = await api.login({ username, password });

        this.token = res.token;
        this.userInfo = res.userInfo;
        this.isLogin = true;

        // 持久化存储
        uni.setStorageSync('token', res.token);
        uni.setStorageSync('userInfo', res.userInfo);

        return res;
      } catch (error) {
        throw error;
      }
    },

    async logout() {
      try {
        await api.logout();
      } finally {
        this.token = '';
        this.userInfo = null;
        this.isLogin = false;

        uni.removeStorageSync('token');
        uni.removeStorageSync('userInfo');

        uni.reLaunch({
          url: '/pages/login/login'
        });
      }
    },

    async checkLogin() {
      if (!this.token) {
        uni.reLaunch({
          url: '/pages/login/login'
        });
        return false;
      }

      try {
        // 验证 token 是否有效
        const res = await api.checkToken();
        this.userInfo = res.userInfo;
        return true;
      } catch (error) {
        this.logout();
        return false;
      }
    }
  }
});
```

### 12. UniApp 如何处理支付功能？

**答：**

```javascript
// utils/payment.js
export const wechatPay = async (orderInfo) => {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.requestPayment({
      provider: 'wxpay',
      timeStamp: orderInfo.timeStamp,
      nonceStr: orderInfo.nonceStr,
      package: orderInfo.package,
      signType: orderInfo.signType,
      paySign: orderInfo.paySign,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    });
    // #endif

    // #ifdef APP-PLUS
    uni.requestPayment({
      provider: 'wxpay',
      orderInfo: orderInfo,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    });
    // #endif
  });
};

export const alipay = async (orderInfo) => {
  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'alipay',
      orderInfo: orderInfo,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 使用示例
const handlePay = async () => {
  try {
    uni.showLoading({ title: '支付中...' });

    // 1. 创建订单
    const order = await api.createOrder({ goodsId: 123 });

    // 2. 调起支付
    const payResult = await wechatPay(order.payInfo);

    // 3. 验证支付结果
    const verifyResult = await api.verifyPayment({ orderId: order.id });

    uni.showToast({
      title: '支付成功',
      icon: 'success'
    });

    // 跳转到订单详情
    uni.redirectTo({
      url: `/pages/order/detail?id=${order.id}`
    });
  } catch (error) {
    uni.showToast({
      title: '支付失败',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};
```

### 13. UniApp 如何实现 WebSocket 通信？

**答：**

```javascript
// utils/websocket.js
class WebSocketService {
  constructor() {
    this.socketTask = null;
    this.isConnected = false;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.listeners = new Map();
  }

  connect(url) {
    return new Promise((resolve, reject) => {
      this.socketTask = uni.connectSocket({
        url,
        success: () => {
          console.log('WebSocket 连接已建立');
        },
        fail: (err) => {
          console.error('WebSocket 连接失败', err);
          reject(err);
        }
      });

      this.socketTask.onOpen(() => {
        this.isConnected = true;
        this.startHeartbeat();
        resolve();
      });

      this.socketTask.onMessage((res) => {
        this.handleMessage(res.data);
      });

      this.socketTask.onError((err) => {
        console.error('WebSocket 错误', err);
        this.reconnect(url);
      });

      this.socketTask.onClose(() => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.reconnect(url);
      });
    });
  }

  send(data) {
    if (!this.isConnected) {
      console.error('WebSocket 未连接');
      return;
    }

    this.socketTask.send({
      data: JSON.stringify(data),
      fail: (err) => {
        console.error('发送消息失败', err);
      }
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      const event = message.event || 'message';

      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach(callback => {
          callback(message.data);
        });
      }
    } catch (error) {
      console.error('解析消息失败', error);
    }
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'heartbeat' });
    }, 30000); // 30秒心跳
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  reconnect(url) {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      console.log('尝试重新连接 WebSocket');
      this.connect(url);
      this.reconnectTimer = null;
    }, 5000);
  }

  close() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socketTask) {
      this.socketTask.close();
    }
  }
}

export default new WebSocketService();
```

**使用示例：**

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import websocket from '@/utils/websocket';

onMounted(async () => {
  await websocket.connect('wss://example.com/ws');

  websocket.on('message', (data) => {
    console.log('收到消息', data);
  });

  websocket.on('notification', (data) => {
    uni.showToast({
      title: data.title,
      icon: 'none'
    });
  });
});

onUnmounted(() => {
  websocket.close();
});

const sendMessage = () => {
  websocket.send({
    type: 'chat',
    content: 'Hello'
  });
};
</script>
```

### 14. UniApp 如何实现原生插件调用？

**答：**

**1. App 端调用原生插件：**

```javascript
// #ifdef APP-PLUS
const module = uni.requireNativePlugin('ModuleName');

module.methodName({
  param1: 'value1',
  param2: 'value2'
}, (result) => {
  console.log('原生插件返回结果', result);
});
// #endif
```

**2. 小程序端扩展组件：**

```json
// manifest.json 配置
{
  "mp-weixin": {
    "plugins": {
      "myPlugin": {
        "version": "1.0.0",
        "provider": "wxidxxxxxx"
      }
    }
  }
}
```

**3. 自定义基座调试：**

```javascript
// App.vue
export default {
  onLaunch() {
    // #ifdef APP-PLUS
    plus.runtime.getProperty(plus.runtime.appid, (info) => {
      console.log('应用版本', info.version);
    });
    // #endif
  }
};
```

### 15. UniApp 性能监控和错误捕获

**答：**

```javascript
// utils/monitor.js
class PerformanceMonitor {
  constructor() {
    this.errors = [];
    this.performance = {};
  }

  // 错误捕获
  captureError(error, vm, info) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      info,
      time: new Date().toISOString(),
      platform: uni.getSystemInfoSync().platform,
      url: getCurrentPages()[getCurrentPages().length - 1]?.route
    };

    this.errors.push(errorInfo);
    this.reportError(errorInfo);
  }

  // 性能监控
  markPageStart(pageName) {
    this.performance[pageName] = {
      startTime: Date.now()
    };
  }

  markPageEnd(pageName) {
    if (this.performance[pageName]) {
      this.performance[pageName].endTime = Date.now();
      this.performance[pageName].duration =
        this.performance[pageName].endTime - this.performance[pageName].startTime;

      this.reportPerformance(pageName, this.performance[pageName]);
    }
  }

  // 上报错误
  async reportError(errorInfo) {
    try {
      await api.reportError(errorInfo);
    } catch (err) {
      console.error('上报错误失败', err);
    }
  }

  // 上报性能数据
  async reportPerformance(pageName, data) {
    try {
      await api.reportPerformance({
        pageName,
        ...data
      });
    } catch (err) {
      console.error('上报性能数据失败', err);
    }
  }
}

export default new PerformanceMonitor();
```

**在 main.js 中配置：**

```javascript
import { createSSRApp } from 'vue';
import monitor from './utils/monitor';

export function createApp() {
  const app = createSSRApp(App);

  // 全局错误处理
  app.config.errorHandler = (err, vm, info) => {
    monitor.captureError(err, vm, info);
  };

  return { app };
}
```

**在页面中使用：**

```vue
<script setup>
import { onLoad, onReady } from '@dcloudio/uni-app';
import monitor from '@/utils/monitor';

onLoad(() => {
  monitor.markPageStart('detail');
});

onReady(() => {
  monitor.markPageEnd('detail');
});
</script>
```

---

## 常见问题汇总

### Q16: UniApp 和 Taro 的区别？

**答：**

| 特性 | UniApp | Taro |
|------|--------|------|
| 开发语言 | Vue | React/Vue |
| 编译方式 | 运行时 | 编译时 |
| 性能 | 接近原生 | 略低于原生 |
| 学习曲线 | 较低（Vue） | 较高（React） |
| 组件库 | 丰富 | 较丰富 |
| 社区活跃度 | 高 | 中 |
| 跨端支持 | 全面 | 全面 |

### Q17: UniApp 如何优化首屏加载速度？

**答：**

1. **分包加载**
```json
{
  "subPackages": [
    {
      "root": "pagesA",
      "pages": [...]
    }
  ]
}
```

2. **图片优化**
   - 使用 WebP 格式
   - 压缩图片大小
   - 懒加载图片

3. **代码优化**
   - Tree Shaking
   - 按需引入组件
   - 减少初始化逻辑

4. **预加载**
```json
{
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pagesA"]
    }
  }
}
```

### Q18: UniApp 如何实现动态修改 tabBar？

**答：**

```javascript
// 动态设置 tabBar 徽标
uni.setTabBarBadge({
  index: 0,
  text: '99+'
});

// 隐藏 tabBar
uni.hideTabBar();

// 显示 tabBar
uni.showTabBar();

// 动态设置 tabBar 样式
uni.setTabBarStyle({
  color: '#999',
  selectedColor: '#007aff',
  backgroundColor: '#fff',
  borderStyle: 'black'
});

// 动态设置某项 tabBar
uni.setTabBarItem({
  index: 0,
  text: '首页',
  iconPath: '/static/tabbar/home.png',
  selectedIconPath: '/static/tabbar/home-active.png'
});
```

### Q19: UniApp 如何实现数据埋点？

**答：**

```javascript
// utils/track.js
class TrackService {
  constructor() {
    this.queue = [];
    this.isReporting = false;
  }

  // 页面浏览埋点
  pageView(pageName) {
    this.track({
      event: 'page_view',
      page: pageName,
      timestamp: Date.now()
    });
  }

  // 事件埋点
  event(eventName, params = {}) {
    this.track({
      event: eventName,
      ...params,
      timestamp: Date.now()
    });
  }

  // 添加到队列
  track(data) {
    const systemInfo = uni.getSystemInfoSync();

    const trackData = {
      ...data,
      platform: systemInfo.platform,
      version: systemInfo.version,
      deviceId: this.getDeviceId()
    };

    this.queue.push(trackData);

    // 达到一定数量或时间后上报
    if (this.queue.length >= 10) {
      this.report();
    }
  }

  // 上报数据
  async report() {
    if (this.isReporting || this.queue.length === 0) return;

    this.isReporting = true;
    const data = [...this.queue];
    this.queue = [];

    try {
      await api.track({ events: data });
    } catch (error) {
      // 失败了放回队列
      this.queue.unshift(...data);
    } finally {
      this.isReporting = false;
    }
  }

  // 获取设备ID
  getDeviceId() {
    let deviceId = uni.getStorageSync('deviceId');

    if (!deviceId) {
      deviceId = this.generateUUID();
      uni.setStorageSync('deviceId', deviceId);
    }

    return deviceId;
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export default new TrackService();
```

**使用示例：**

```vue
<script setup>
import { onLoad } from '@dcloudio/uni-app';
import track from '@/utils/track';

onLoad(() => {
  track.pageView('product-detail');
});

const handleBuy = () => {
  track.event('click_buy', {
    productId: 123,
    price: 99.9
  });
};
</script>
```

### Q20: UniApp 中如何处理深色模式适配？

**答：**

**1. 配置支持深色模式：**

```json
// manifest.json
{
  "app-plus": {
    "darkmode": true,
    "themeLocation": "theme.json"
  }
}
```

**2. 创建主题配置：**

```json
// theme.json
{
  "light": {
    "navBgColor": "#ffffff",
    "navTxtColor": "#000000"
  },
  "dark": {
    "navBgColor": "#1a1a1a",
    "navTxtColor": "#ffffff"
  }
}
```

**3. CSS 变量适配：**

```css
/* App.vue */
page {
  --bg-color: #ffffff;
  --text-color: #333333;
}

@media (prefers-color-scheme: dark) {
  page {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
  }
}

/* 使用变量 */
.container {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

**4. JS 动态获取：**

```javascript
const isDarkMode = () => {
  const systemInfo = uni.getSystemInfoSync();
  return systemInfo.theme === 'dark';
};

// 监听主题切换
uni.onThemeChange((res) => {
  console.log('当前主题：', res.theme);
});
```

---

## 学习资源

- [UniApp 官方文档](https://uniapp.dcloud.net.cn/)
- [UniApp 插件市场](https://ext.dcloud.net.cn/)
- [Vue3 文档](https://cn.vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)

---

**总结：** UniApp 是一个优秀的跨端开发框架，掌握其核心概念、生命周期、路由通信、跨端适配等知识点，能够高效开发多端应用。结合 Vue3 和 TypeScript，可以构建类型安全、性能优秀的现代应用。

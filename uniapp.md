# UniApp + Vue3 面试题（以 UniApp 为主）

说明：以下题目聚焦 UniApp 在多端（H5/小程序/App）开发中的实战要点，并结合 Vue3 的组合式 API 与工程化能力。每题附简要考点，辅助面试快速判断掌握程度。

## 基础与工程
1) UniApp 与 Vue3 的关系是什么？
- 考点：UniApp 是跨端框架，Vue3 是前端框架；UniApp 支持以 Vue2/3 语法开发并编译到多端。

2) `pages.json` 的作用？常见配置项有哪些？
- 考点：页面路由、`tabBar`、`globalStyle`、分包 `subPackages`、预下载 `preloadRule`、窗口样式 `navigationBarTitleText`、`navigationStyle: custom`。

3) UniApp 的目录与静态资源规范？
- 考点：`/pages` 页面、`/static` 资源（不经编译）、`/components` 组件、`/uni_modules` 扩展；`@` 指向 `src`（CLI 项目）。

4) 条件编译如何使用？
- 考点：`#ifdef H5`、`#ifdef MP-WEIXIN`、`#ifdef APP-PLUS` 等，按平台包含/排除代码，避免跨端不兼容 API。

## 路由与页面生命周期
5) `navigateTo` / `redirectTo` / `switchTab` / `reLaunch` / `navigateBack` 场景区别？
- 考点：栈压入/替换、跳转 `tab` 页、重启应用栈、返回层级；小程序与 H5 行为差异。

6) 页面生命周期与 Vue3 组件生命周期如何区分与配合？
- 考点：页面：`onLoad/onShow/onHide/onUnload/onReachBottom/onPullDownRefresh`；组件：`onMounted/onUnmounted`；页面显示切换不会重复触发组件 `setup`。

7) `onShow` 与 `onMounted` 在页面重复进入时有何差异？
- 考点：`onShow` 每次页面显示都会触发；`onMounted` 仅在组件首次挂载执行。

8) 如何实现下拉刷新与上拉触底？
- 考点：`onPullDownRefresh`、`stopPullDownRefresh`；`onReachBottom`；`pages.json` 开启 `enablePullDownRefresh`。

## 组合式 API 与状态管理
9) 在 `<script setup>` 中使用 `defineProps/defineEmits` 的注意点？
- 考点：编译期宏、无 `this`；类型在 TS 下用 `withDefaults`、接口定义。

10) `ref` 与 `reactive` 的使用场景与陷阱？
- 考点：`ref` 适原始值；`reactive` 适对象；解构丢失响应性需 `toRefs/toRef`；深浅响应与性能权衡。

11) 如何在 UniApp 中集成 Pinia？
- 考点：创建 `pinia`，在 `App.vue` 或入口 `main.js` 挂载；`defineStore`；跨端持久化可用 `setStorage` 或插件（H5/小程序差异）。

12) 组件通信方案有哪些？
- 考点：`props/emits`、`v-model`、依赖注入 `provide/inject`、全局事件 `uni.$on/$emit`（注意销毁）、全局 store。

13) 监听路由/页面参数的最佳实践？
- 考点：在页面 `onLoad` 读取 `options`；H5 用 URL 查询；组合式 `watch` 监听参数变化。

## 网络、缓存与文件
14) `uni.request` 如何封装？拦截器实现思路？
- 考点：统一基地址、header（token）、错误码处理、重试/超时；用 `Promise` 包装；按平台替换域名与证书策略。

15) 小程序/H5/App 文件上传与下载差异？
- 考点：`uploadFile/downloadFile` 能力差异；H5 用 `fetch`/`axios`；App 可用 `plus.io` 扩展。

16) 本地存储的限制与策略？
- 考点：`setStorage/getStorage`（异步）、`setStorageSync/getStorageSync`（同步）；容量限制（小程序）与序列化；命名空间与过期策略。

17) 图片选择与预览实现注意点？
- 考点：`chooseImage/previewImage`；临时路径 `tempFilePath`；压缩与清理；iOS/Android 差异。

## 多端差异与原生能力
18) H5 与微信小程序 API 差异如何适配？
- 考点：用 `uni.*` 统一 API；必要时用条件编译分支；避免直接操作 `window/document`。

19) App 端原生能力如何使用？
- 考点：`APP-PLUS` 下的 `plus.*`（推送、文件、webview）；`manifest.json` 权限配置；原生混合（自定义导航）。

20) `navigationStyle: custom` 自定义导航栏的实现要点？
- 考点：隐藏系统导航栏，自绘标题/返回；处理状态栏安全区 `safe-area`；不同端兼容样式。

21) `nvue` 与 `vue` 页面对比？
- 考点：`nvue` 基于 Weex 原生渲染，性能更好但样式/DOM 能力受限；`vue` Web 渲染能力强，跨端一致性更好。

## 构建与发布
22) 分包与预下载的配置与影响？
- 考点：`subPackages` 切割体积；`preloadRule` 提前拉取资源；首屏性能与跳转速度优化。

23) 不同平台的打包与调试流程？
- 考点：微信开发者工具（预览/真机）、H5 本地/线上、App 真机与 `adb logcat`；排查白屏与权限。

24) 发布前性能优化清单？
- 考点：减少 `setData` 次数、列表虚拟化或懒加载、图片压缩、按需加载组件、缓存与去抖节流。

## Vue3 深入（结合 UniApp）
25) `watch` 与 `watchEffect` 的区别及使用场景？
- 考点：`watch` 监听特定源，支持 `immediate/deep`；`watchEffect` 依赖收集自动触发，适合副作用初始化。

26) 如何在组合式 API 中使用异步与取消？
- 考点：在 `onMounted/onShow` 发起请求；用标志位/`AbortController` 取消；页面隐藏停止轮询。

27) 组件性能问题定位思路？
- 考点：拆分组件、`v-if` vs `v-show`、计算属性缓存、`watch` 精确源、避免大对象响应式、条件编译减少不必要代码。

28) 在 UniApp 中使用 TypeScript 的要点？
- 考点：`<script setup lang="ts">`、为 `props/emits` 声明类型、为 Pinia store 与工具函数加类型；第三方 d.ts 补充。

## 场景题/实战题
29) 设计一个请求层支持 token 自动刷新与队列等待，兼容 H5/小程序。
- 考点：401 拦截、刷新 token 单例队列、失败回退、错误提示与重试、平台适配。

30) 列表页支持下拉刷新与分页加载，跨端一致的骨架屏与空态。
- 考点：分页状态机、`onPullDownRefresh/onReachBottom`、骨架组件、空态组件、错误态复用。

31) 在 `tabBar` 场景下保持页面状态不丢失并正确响应 `onShow`。
- 考点：`keepAlive` 思路（自管状态）、Pinia 持久化、`onShow` 拉新数据、避免重复初始化。

32) 封装跨端文件选择与上传组件。
- 考点：H5 input、微信 `chooseImage`、App `plus.io`；统一返回值结构与错误处理。

33) 基于条件编译封装平台差异的分享功能。
- 考点：`#ifdef` 分支、各端分享能力（微信/APP/H5）、回调与埋点。

## 常见坑与排查
- 直接使用 DOM/`window` 在非 H5 平台会报错：用 `uni.*` 或条件编译。
- 组件内频繁大对象 `reactive` 引发性能问题：改用 `ref` 与 `toRef`。
- 页面返回后数据未更新：用 `onShow` 处理刷新逻辑而非只在 `onLoad`。
- 小程序存储容量受限：设置合理过期与分表键名；必要时转云存储。
- 自定义导航未考虑安全区：使用 `safe-area-inset-*` 与平台判断。

—— 完 ——
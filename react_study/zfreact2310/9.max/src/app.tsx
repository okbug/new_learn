import { notification, message, Dropdown, Avatar, Menu, Space } from "antd";
import { history } from '@umijs/max';
import HeaderMenu from "./components/HeaderMenu";
enum ERROR_SHOW_TYPE {
  SILENT = 0,//安静不提示
  WARN = 1,//显示警告
  ERROR = 2,//显示错误
  NOTIFICATION = 3//简单提醒就可以
}
const errorThrower = (response) => {
  const { success, errorCode, errorMessage, showType } = response;
  //因为如果这里的 success如果为false,说明请求失败了，这个失败是业务失败，业务异常
  if (!success) {
    const error = new Error(errorMessage);
    error.name = 'BizError'
    error.cause = { errorCode, errorMessage, showType };
    throw error;
  }
}
const errorHandler = (error) => {
  if (error.name === 'BizError') {
    const errorCause = error.cause;
    if (errorCause) {
      const { errorCode, errorMessage, showType } = errorCause;
      switch (showType) {
        case ERROR_SHOW_TYPE.SILENT:
          break;
        case ERROR_SHOW_TYPE.WARN:
          message.warning(errorMessage);
          break;
        case ERROR_SHOW_TYPE.ERROR:
          message.error(errorMessage);
          break;
        case ERROR_SHOW_TYPE.NOTIFICATION:
          notification.open({
            description: errorMessage,
            message: errorCode
          })
          break;
        default:
          message.error(errorMessage)
      }
    }
  } else if (error.response) {
    message.error(`响应状态码为:${error.response.status}`);
  } else if (error.request) {
    message.error(`没有收到响应`);
  } else {
    message.error(`请求发送失败`);
  }
}
export const request = {
  timeout: 3000,
  headers: {
    ['Content-Type']: 'application/json',
    'Accept': 'application/json',
    credentials: 'include'
  },
  errorConfig: {
    errorThrower,
    errorHandler
  },
  requestInterceptors: [
    [(url, options) => { 
      const token = localStorage.getItem('token');
      if(!options.headers)options.headers={};
      if(token){
        options.headers.authorization = token;
      }
      return { url, options } 
    }, (error) => { return Promise.reject(error) }],
  ],
  responseInterceptors: [
    [(response) => response, (error) => { return Promise.reject(error) }]
  ]
}
interface InitialState {
  currentUser: API.User | null
}
//getInitialState()，其返回值将成为全局初始状态
export async function getInitialState() {
  let initialState: InitialState = {
    currentUser: null
  }
  return initialState;
}
export const layout = ({ initialState,setInitialState }) => {
  return {
    title: 'UMI-MAX',
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    onPageChange(location) {
      //如果当前前访问的页面是登录页或者注册页的话，直接可以访问
      if (location.pathname === '/signin' || location.pathname === '/signup') {
        return;
      }
      //否则则判断当前的用户是否登录过，如果未登录，则跳到登录页进行登录
      const { currentUser } = initialState;
      if (!currentUser) {
        history.push('/signin');
      }
    },
    actionsRender: () => {
      const { currentUser } = initialState;
      if (!currentUser) return null;
      return [
        <HeaderMenu/>
      ];
    },
  }
}
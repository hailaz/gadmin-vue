import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken, getTokenExpireTime } from '@/utils/auth'
/* 是否有请求正在刷新token*/
window.isRefreshing = false
/* 被挂起的请求数组*/
let refreshSubscribers = []
function isTokenExpired() {
  var exp = getTokenExpireTime()
  if (!exp) {
    return false
  }
  var nowTime = new Date()
  var date = new Date(exp)
  var expSec = parseInt((date.getTime() - nowTime.getTime()) / 1000)
  if (expSec < 300) {
    return true
  }
  return false
}

/* push所有请求到数组中*/
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

/* 刷新请求（refreshSubscribers数组中的请求得到新的token之后会自执行，用新的token去请求数据）*/
function onRrefreshed(token) {
  refreshSubscribers.map(cb => cb(token))
}

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      if (isTokenExpired()) {
        if (!window.isRefreshing) {
          /* 将刷新token的标志置为true*/
          window.isRefreshing = true
          store.dispatch('user/refreshToken').then(() => {
            /* 执行数组里的函数,重新发起被挂起的请求*/
            onRrefreshed(getToken())
            /* 执行onRefreshed函数后清空数组中保存的请求*/
            refreshSubscribers = []
            /* 将标志置为false*/
            window.isRefreshing = false
          }).catch(() => {

          })

          /* 把请求(token)=>{....}都push到一个数组中*/
          const retry = new Promise((resolve, reject) => {
            /* (token) => {...}这个函数就是回调函数*/
            subscribeTokenRefresh((token) => {
              config.headers['Authorization'] = token
              /* 将请求挂起*/
              resolve(config)
            })
          })
          return retry
        }
      }
      // let each request carry token --['X-Token'] as a custom key.
      // please modify it according to the actual situation.

      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code.
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000) {
      Message({
        message: res.message || 'error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 401 || res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(res.message || 'error')
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service

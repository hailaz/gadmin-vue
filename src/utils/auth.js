import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const ExpireTime = 'Expire-Time'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  removeTokenExpireTime()
  return Cookies.remove(TokenKey)
}

export function getTokenExpireTime() {
  return Cookies.get(ExpireTime)
}

export function setTokenExpireTime(token) {
  return Cookies.set(ExpireTime, token)
}

export function removeTokenExpireTime() {
  return Cookies.remove(ExpireTime)
}

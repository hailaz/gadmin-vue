import request from '@/utils/request'

export function list(query) {
  return request({
    url: '/user/list',
    method: 'get',
    params: query
  })
}

export function loginkey() {
  return request({
    url: '/loginkey',
    method: 'get'
  })
}

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function refreshToken() {
  return request({
    url: '/refresh_token',
    method: 'get'
  })
}

export function getInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

export function getUsers(query) {
  return request({
    url: '/user',
    method: 'get',
    params: query
  })
}

export function addUser(data) {
  return request({
    url: '/user',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: `/user`,
    method: 'put',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: `/user`,
    method: 'delete',
    data
  })
}

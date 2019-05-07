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
    url: '/user/loginkey',
    method: 'get'
  })
}

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
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

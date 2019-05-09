import request from '@/utils/request'

export function list(query) {
  return request({
    url: '/v1/user/list',
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

export function getInfo(token) {
  return request({
    url: '/v1/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/v1/user/logout',
    method: 'post'
  })
}

export function getUsers(query) {
  return request({
    url: '/v1/user',
    method: 'get',
    params: query
  })
}

export function addUser(data) {
  return request({
    url: '/v1/user',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: `/v1/user`,
    method: 'put',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: `/v1/user`,
    method: 'delete',
    data
  })
}

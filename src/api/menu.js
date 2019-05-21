import request from '@/utils/request'

export function getUserMenus(query) {
  return request({
    url: '/v1/user/menu',
    method: 'get',
    params: query
  })
}

export function getMenus(query) {
  return request({
    url: '/v1/menu',
    method: 'get',
    params: query
  })
}

export function addMenu(data) {
  return request({
    url: '/v1/menu',
    method: 'post',
    data
  })
}

export function updateMenu(data) {
  return request({
    url: `/v1/menu`,
    method: 'put',
    data
  })
}

export function deleteMenu(data) {
  return request({
    url: `/v1/menu`,
    method: 'delete',
    data
  })
}


import request from '@/utils/request'

export function getUserMenus(query) {
  return request({
    url: '/user/menu',
    method: 'get',
    params: query
  })
}

export function getMenus(query) {
  return request({
    url: '/menu',
    method: 'get',
    params: query
  })
}

export function addMenu(data) {
  return request({
    url: '/menu',
    method: 'post',
    data
  })
}

export function updateMenu(data) {
  return request({
    url: `/menu`,
    method: 'put',
    data
  })
}

export function deleteMenu(data) {
  return request({
    url: `/menu`,
    method: 'delete',
    data
  })
}


import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: '/routes',
    method: 'get'
  })
}

export function getRoles(query) {
  return request({
    url: '/role',
    method: 'get',
    params: query
  })
}

export function addRole(data) {
  return request({
    url: '/role',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: `/role`,
    method: 'put',
    data
  })
}

export function deleteRole(data) {
  return request({
    url: `/role`,
    method: 'delete',
    data
  })
}

export function setUserRoleByUserName(data) {
  return request({
    url: '/role/byuser',
    method: 'put',
    data
  })
}

export function setRoleMenus(data) {
  return request({
    url: '/role/menu',
    method: 'put',
    data
  })
}

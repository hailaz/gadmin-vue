import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: '/v1/routes',
    method: 'get'
  })
}

export function getRoles(query) {
  return request({
    url: '/v1/role',
    method: 'get',
    params: query
  })
}

export function addRole(data) {
  return request({
    url: '/v1/role',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: `/v1/role`,
    method: 'put',
    data
  })
}

export function deleteRole(data) {
  return request({
    url: `/v1/role`,
    method: 'delete',
    data
  })
}

export function setUserRoleByUserName(data) {
  return request({
    url: '/v1/role/byuser',
    method: 'put',
    data
  })
}

export function setRoleMenus(data) {
  return request({
    url: '/v1/role/menu',
    method: 'put',
    data
  })
}

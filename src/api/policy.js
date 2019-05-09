import request from '@/utils/request'

export function getPolicys(query) {
  return request({
    url: '/v1/policy',
    method: 'get',
    params: query
  })
}

export function updatePolicy(data) {
  return request({
    url: `/v1/policy`,
    method: 'put',
    data
  })
}

export function getPolicyByRole(query) {
  return request({
    url: '/v1/policy/byrole',
    method: 'get',
    params: query
  })
}

export function setPolicyByRole(data) {
  return request({
    url: '/v1/policy/byrole',
    method: 'put',
    data
  })
}

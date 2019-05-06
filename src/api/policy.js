import request from '@/utils/request'

export function getPolicys(query) {
  return request({
    url: '/policy',
    method: 'get',
    params: query
  })
}

export function updatePolicy(data) {
  return request({
    url: `/policy`,
    method: 'put',
    data
  })
}


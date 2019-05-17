import { asyncRoutes, constantRoutes } from '@/router'
// import { constantRoutes } from '@/router'
import { getUserMenus } from '@/api/menu'
/* Layout */
// import Layout from '@/layout'

export const componentsMap = {
  'layout': () => import('@/layout'),
  'user/user': () => import('@/views/user/user'),
  'user/role': () => import('@/views/user/role'),
  'user/policy': () => import('@/views/user/policy'),
  'user/menu': () => import('@/views/user/menu')
}

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 *将后台的路由表进行格式化
 * @param {*} asyncRouterMap
 */
function convertRouter(asyncRouterMap) {
  const accessedRouters = []
  if (asyncRouterMap) {
    asyncRouterMap.forEach(item => {
      var parent = generateRouter(item, true)
      parent.children = getChildrenMenu(item.children)
      accessedRouters.push(parent)
    })
    accessedRouters.sort(function(a, b) { // 升序
      return a.sort - b.sort
    })
  }
  accessedRouters.push({ path: '*', redirect: '/404', hidden: true }) // 404错误页面，一定要放最后
  return accessedRouters
}

// 递归获取子菜单
function getChildrenMenu(childrenList) {
  var childrenMenu = []
  if (childrenList) {
    childrenList.forEach(child => {
      var cMenu = generateRouter(child, false)
      cMenu.children = getChildrenMenu(child.children)
      childrenMenu.push(cMenu)
    })
    childrenMenu.sort(function(a, b) { // 升序
      return a.sort - b.sort
    })
  }
  return childrenMenu
}

function generateRouter(item, isParent) {
  var router = {
    path: item.path,
    name: item.name,
    meta: item.meta,
    sort: item.sort,
    redirect: item.redirect,
    alwaysShow: item.alwaysShow,
    hidden: item.hidden,
    // component: isParent ? Layout : () => import('@/' + item.component)
    component: componentsMap[item.component]
  }
  return router
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    if (roles == null) {
      return new Promise(resolve => {
        let accessedRoutes
        // console.log(JSON.stringify(accessedRoutes))
        // console.log(JSON.stringify(asyncRoutes))
        if (roles.includes('admin')) {
          accessedRoutes = asyncRoutes || []
        } else {
          accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
        }
        // console.log(JSON.stringify(accessedRoutes))
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      })
    } else {
      return new Promise((resolve, reject) => {
        getUserMenus().then(response => {
          const asyncRoutes = response.data
          // console.log(constantRoutes)
          // console.log(asyncRoutes)
          let accessedRoutes
          if (roles.includes('admin')) {
            accessedRoutes = asyncRoutes || []
          } else {
            accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
          }

          accessedRoutes = convertRouter(accessedRoutes)
          // console.log(accessedRoutes)
          // console.log('====')
          // console.log(JSON.stringify(accessedRoutes))
          commit('SET_ROUTES', accessedRoutes)
          resolve(accessedRoutes)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

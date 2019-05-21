<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input v-model="listQuery.name" placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button> -->
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column :label="$t('table.role')" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.role }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.roleName')" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" min-width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdatePolicy(row)">
            {{ $t('table.policy') }}
          </el-button>
          <el-button type="primary" size="mini" @click="viewMenu(row)">
            {{ $t('table.menu') }}
          </el-button>
          <el-button size="mini" type="danger" @click="handleModifyStatus(row,'deleted')">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('table.role')" prop="role">
          <el-input v-if="dialogStatus==='create'" v-model="temp.role" />
          <span v-else>{{ temp.role }}</span>
        </el-form-item>
        <el-form-item :label="$t('table.roleName')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPolicyVisible" title="权限修改">
      <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
      <div style="margin: 15px 0;" />
      <el-checkbox-group v-model="checkedPolicys" @change="handleCheckedPolicysChange">
        <el-checkbox v-for="policy in allPolicys" :key="policy.policy" :label="policy.policy">{{ policy.name }}</el-checkbox>
      </el-checkbox-group>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogPolicyVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="handleUpdateRolePolicy()">
          {{ $t('table.confirm') }}
        </el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="dialogViewMenuVisible" title="预览菜单">
      <el-form label-width="80px" label-position="left">
        <el-tree ref="tree" :data="routesData" :check-strictly="checkStrictly" :props="defaultProps" show-checkbox :default-expand-all="true" node-key="name" class="permission-tree" />
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogViewMenuVisible=false">
          {{ $t('permission.cancel') }}
        </el-button>
        <el-button type="primary" @click="confirmRoleMenus">
          {{ $t('permission.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserMenus } from '@/api/menu'
import { getRoles, addRole, updateRole, deleteRole, setRoleMenus } from '@/api/role'
import { getPolicyByRole, setPolicyByRole } from '@/api/policy'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import path from 'path'
import i18n from '@/lang'

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        name: undefined,
        sort: '+id'
      },
      showReviewer: false,
      temp: {
        role: '',
        name: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        role: [{ required: true, message: 'role is required', trigger: 'blur' }],
        name: [{ required: true, message: 'name is required', trigger: 'blur' }]
      },
      dialogPolicyVisible: false,
      checkAll: false,
      checkedPolicys: [],
      checkedAllPolicys: [],
      allPolicys: [],
      isIndeterminate: false,
      currentRole: '',
      routes: [],
      roleRoutes: [],
      dialogViewMenuVisible: false,
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    this.getList()
  },
  methods: {
    i18n(routes) {
      const app = routes.map(route => {
        route.title = i18n.t(`route.${route.title}`)
        if (route.children) {
          route.children = this.i18n(route.children)
        }
        return route
      })

      return app
    },
    getList() {
      this.listLoading = true
      getRoles(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1 * 500)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      if (status === 'deleted') {
        this.handleDelete(row)
      }
    },
    resetTemp() {
      this.temp = {
        role: '',
        name: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.author = 'vue-element-admin'// TODO
          addRole(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdatePolicy(row) {
      // this.temp = Object.assign({}, row) // copy obj
      this.currentRole = row.role
      getPolicyByRole({ role: row.role }).then(response => {
        this.allPolicys = []
        this.checkedPolicys = []
        this.checkedAllPolicys = []
        response.data.all_policy_items.forEach(item => {
          this.checkedAllPolicys.push(item.policy)
          if (item.name !== '') {
            this.allPolicys.push(item)
          } else {
            item.name = item.policy
            this.allPolicys.push(item)
          }
        })
        response.data.role_policy_items.forEach(item => {
          this.checkedPolicys.push(item.policy)
        })
        if (this.checkedPolicys.length > 0) {
          this.checkAll = this.checkedPolicys.length === this.allPolicys.length
          this.isIndeterminate = !this.checkAll
        } else {
          this.isIndeterminate = false
          this.checkAll = false
        }

        this.dialogPolicyVisible = true
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateRole(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('是否删除？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }).then(() => {
        this.temp = Object.assign({}, row) // copy obj
        deleteRole(this.temp).then(() => {
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      })
    },
    handleCheckAllChange(val) {
      this.checkedPolicys = val ? this.checkedAllPolicys : []
      this.isIndeterminate = false
    },
    handleCheckedPolicysChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.allPolicys.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.allPolicys.length
    },
    handleUpdateRolePolicy() {
      setPolicyByRole({ role: this.currentRole, policys: this.checkedPolicys }).then(() => {
        this.currentRole = ''
        this.dialogPolicyVisible = false
        this.$message({
          type: 'success',
          message: 'success!'
        })
      })
    },
    viewMenu(row) {
      this.currentRole = row.role
      getUserMenus({ rolename: row.role }).then(response => {
        this.roleRoutes = response.data.role_menus
        const routes = this.generateRoutes(response.data.menus)
        this.routes = this.i18n(routes)
        this.dialogViewMenuVisible = true
        this.checkStrictly = true
        this.$nextTick(() => {
          const routes = this.generateRoutes(this.roleRoutes)
          this.$refs.tree.setCheckedNodes(this.generateArr(routes))
          // set checked state of a node not affects its father and child nodes
          this.checkStrictly = false
        })
      })
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    generateRoutes(routes, basePath = '/') {
      const res = []
      routes.sort(function(a, b) { // 升序
        return a.sort - b.sort
      })
      for (let route of routes) {
        // skip some route
        if (route.hidden) { continue }

        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          name: route.name,
          path: path.resolve(basePath, route.path),
          title: route.meta && route.meta.title,
          parent_name: route.parent_name
        }

        // recursive child routes
        if (route.children) {
          route.children.sort(function(a, b) { // 升序
            return a.sort - b.sort
          })
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },
    getRealKeys(keys) {
      const realKeys = []
      keys.forEach(key => {
        realKeys.push(key.name)
        if (key.parent_name !== '') {
          realKeys.push(key.parent_name)
        }
      })

      return Array.from(new Set(realKeys))
    },
    async confirmRoleMenus() {
      const checkedNodes = this.$refs.tree.getCheckedNodes()
      setRoleMenus({ role: this.currentRole, menus: this.getRealKeys(checkedNodes) }).then(() => {
        this.currentRole = ''
        this.dialogViewMenuVisible = false
        this.$message({
          type: 'success',
          message: 'success!'
        })
      })
    },
    // reference: src/view/layout/components/Sidebar/SidebarItem.vue
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      if (children == null) {
        return false
      }
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
    }
  }
}
</script>

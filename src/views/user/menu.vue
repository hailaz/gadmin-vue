<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-zoom-in" @click="viewMenu">
        预览菜单
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
      <el-table-column width="100px" :label="$t('table.name')">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" :label="$t('table.title')">
        <template slot-scope="scope">
          <span>{{ $t('route.'+scope.row.meta.title) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.path')" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>

      <el-table-column width="80px" :label="$t('table.component')">
        <template slot-scope="scope">
          <span>{{ scope.row.component }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100px" :label="$t('table.redirect')">
        <template slot-scope="scope">
          <span>{{ scope.row.redirect }}</span>
        </template>
      </el-table-column>

      <el-table-column width="110px" :label="$t('table.hidden')">
        <template slot-scope="scope">
          <span>{{ scope.row.hidden }}</span>
        </template>
      </el-table-column>

      <el-table-column width="110px" :label="$t('table.alwaysShow')">
        <template slot-scope="scope">
          <span>{{ scope.row.alwaysShow }}</span>
        </template>
      </el-table-column>

      <el-table-column width="110px" :label="$t('table.parentName')">
        <template slot-scope="scope">
          <span>{{ scope.row.parent_name }}</span>
        </template>
      </el-table-column>

      <el-table-column width="80px" :label="$t('table.sort')">
        <template slot-scope="scope">
          <span>{{ scope.row.sort }}</span>
        </template>
      </el-table-column>

      <el-table-column width="110px" :label="$t('table.icon')">
        <template slot-scope="scope">
          <svg-icon :icon-class="setIcon(scope.row.meta.icon)" />
          <span>{{ scope.row.meta.icon }}</span>
        </template>
      </el-table-column>

      <el-table-column width="110px" :label="$t('table.noCache')">
        <template slot-scope="scope">
          <span>{{ scope.row.meta.noCache }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button v-if="!row.auto_create" size="mini" type="danger" @click="handleModifyStatus(row,'deleted')">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('table.name')" prop="name">
          <el-input v-if="dialogStatus==='create'" v-model="temp.name" />
          <span v-else>{{ temp.name }}</span>
        </el-form-item>
        <el-form-item :label="$t('table.title')" prop="title">
          <el-input v-model="temp.meta.title" />
        </el-form-item>
        <el-form-item :label="$t('table.path')" prop="path">
          <el-input v-model="temp.path" />
        </el-form-item>
        <el-form-item :label="$t('table.redirect')" prop="redirect">
          <el-input v-model="temp.redirect" />
        </el-form-item>

        <el-form-item :label="$t('table.hidden')" prop="hidden">
          <el-select v-model="temp.hidden" class="filter-item" placeholder="Please select">
            <el-option v-for="item in tofOptions" :key="item.key" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('table.alwaysShow')" prop="alwaysShow">
          <el-select v-model="temp.alwaysShow" class="filter-item" placeholder="Please select">
            <el-option v-for="item in tofOptions" :key="item.key" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('table.parentName')" prop="parentName">
          <el-select v-model="temp.parent_name" class="filter-item" placeholder="Please select">
            <el-option key="null" label="Null" value="" />
            <el-option v-for="item in menuNameList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('table.component')" prop="component">
          <el-input v-model="temp.component" />
        </el-form-item>
        <el-form-item :label="$t('table.sort')" prop="sort">
          <el-input v-model="temp.sort" />
        </el-form-item>
        <el-form-item :label="$t('table.icon')" prop="icon">
          <el-select v-model="temp.meta.icon" class="filter-item" placeholder="Please select">
            <!-- <svg-icon icon-class="user" /> -->
            <el-option key="null" label="Null" value="" />
            <el-option v-for="item in svgIcons" :key="item" :label="item" :value="item" />
          </el-select>
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

    <el-dialog :visible.sync="dialogViewMenuVisible" title="预览菜单">
      <el-form label-width="80px" label-position="left">
        <el-tree ref="tree" :data="routesData" :props="defaultProps" node-key="path" :default-expand-all="true" class="permission-tree" />
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogViewMenuVisible=false">
          {{ $t('table.close') }}
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getMenus, addMenu, updateMenu, deleteMenu, getUserMenus } from '@/api/menu'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import path from 'path'
import i18n from '@/lang'
import svgIcons from '@/utils/svg-icons'

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
        name: '',
        path: '',
        component: '',
        redirect: '',
        parent_name: '',
        sort: 0,
        hidden: false,
        alwaysShow: false,
        meta: {
          title: '', noCache: false, icon: ''
        }
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
      },
      tofOptions: [
        { key: 1, label: '是', value: true },
        { key: 0, label: '否', value: false }
      ],
      menuNameList: [],
      routes: [],
      dialogViewMenuVisible: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      svgIcons: svgIcons
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
    async getRoutes() {
      const res = await getUserMenus()
      this.serviceRoutes = res.data
      const routes = this.generateRoutes(res.data)

      this.routes = this.i18n(routes)
    },
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
      getMenus(this.listQuery).then(response => {
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
        name: '',
        path: '',
        component: '',
        redirect: '',
        parent_name: '',
        sort: 0,
        hidden: false,
        alwaysShow: false,
        meta: {
          title: '', noCache: false, icon: ''
        }
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
          addMenu(this.temp).then(() => {
            this.dialogFormVisible = false
            this.getList()
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
      this.menuNameList = []
      this.list.forEach(item => {
        if (item.name !== row.name) {
          this.menuNameList.push(item.name)
        }
      })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateMenu(tempData).then(() => {
            this.dialogFormVisible = false
            this.getList()
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
        deleteMenu({ name: row.name }).then(() => {
          this.getList()
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      })
    },
    setIcon(icon) {
      return icon
    },
    viewMenu() {
      this.getRoutes()
      this.dialogViewMenuVisible = true
      this.checkStrictly = true
      this.$nextTick(() => {
        const routes = this.generateRoutes(this.routes)
        this.$refs.tree.setCheckedNodes(this.generateArr(routes))
        // set checked state of a node not affects its father and child nodes
        this.checkStrictly = false
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
          path: path.resolve(basePath, route.path),
          title: route.meta && route.meta.title

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
<style lang="scss" scoped>
.app-container {
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>

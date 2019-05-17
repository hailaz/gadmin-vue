<template>
  <div class="app-container">
    <div class="filter-container">
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
      <el-table-column width="180px" :label="$t('table.name')">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" :label="$t('table.title')">
        <template slot-scope="scope">
          <span>{{ scope.row.meta.title }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.path')" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>

      <el-table-column width="80px" :label="$t('table.component')">
        <template slot-scope="scope">
          <span>{{ scope.row.component }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" :label="$t('table.redirect')">
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

      <el-table-column width="110px" :label="$t('table.sort')">
        <template slot-scope="scope">
          <span>{{ scope.row.sort }}</span>
        </template>
      </el-table-column>

      <el-table-column width="110px" :label="$t('table.icon')">
        <template slot-scope="scope">
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
          <el-button v-if="row.user_name!='admin'" size="mini" type="danger" @click="handleModifyStatus(row,'deleted')">
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
          <el-input v-model="temp.meta.icon" />
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

  </div>
</template>

<script>
import { getMenus, addMenu, updateMenu, deleteMenu } from '@/api/menu'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

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
      menuNameList: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
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
    }
  }
}
</script>

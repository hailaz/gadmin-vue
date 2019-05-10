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
      <el-table-column align="center" :label="$t('table.id')" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="80px" :label="$t('table.userName')">
        <template slot-scope="scope">
          <span>{{ scope.row.user_name }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" :label="$t('table.nickName')">
        <template slot-scope="scope">
          <span>{{ scope.row.nick_name }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" :label="$t('table.email')">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>

      <el-table-column width="110px" :label="$t('table.phone')">
        <template slot-scope="scope">
          <span>{{ scope.row.phone }}</span>
        </template>
      </el-table-column>

      <el-table-column width="110px" :label="$t('table.status')">
        <template slot-scope="scope">
          <span>{{ scope.row.status }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column width="80px" :label="$t('table.addUser')">
        <template slot-scope="scope">
          <span>{{ scope.row.add_user_id }}</span>
        </template>
      </el-table-column> -->

      <el-table-column width="180px" align="center" :label="$t('table.addtime')">
        <template slot-scope="scope">
          <span>{{ scope.row.add_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" :label="$t('table.updatetime')">
        <template slot-scope="scope">
          <span>{{ scope.row.update_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button v-if="row.user_name!='admin'" type="primary" size="mini" @click="handleUpdateRole(row)">
            {{ $t('table.role') }}
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
        <el-form-item :label="$t('table.userName')" prop="user_name">
          <el-input v-if="dialogStatus==='create'" v-model="temp.user_name" />
          <span v-else>{{ temp.user_name }}</span>
        </el-form-item>
        <el-form-item :label="$t('table.nickName')" prop="nick_name">
          <el-input v-model="temp.nick_name" />
        </el-form-item>
        <el-form-item :label="$t('table.password')" prop="password">
          <el-input v-model="temp.password" type="password" />
        </el-form-item>
        <el-form-item :label="$t('table.passwordconfirm')" prop="passwordconfirm">
          <el-input v-model="temp.passwordconfirm" type="password" />
        </el-form-item>
        <el-form-item :label="$t('table.email')" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item :label="$t('table.phone')" prop="phone">
          <el-input v-model="temp.phone" />
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

    <el-dialog :visible.sync="dialogRoleVisible" title="权限修改">
      <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
      <div style="margin: 15px 0;" />
      <el-checkbox-group v-model="checkedRoles" :min="1" @change="handleCheckedRolesChange">
        <el-checkbox v-for="role in allRoles" :key="role.role" :label="role.role">{{ role.name }}</el-checkbox>
      </el-checkbox-group>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogRoleVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="handleUpdateRoleRole()">
          {{ $t('table.confirm') }}
        </el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { getUsers, addUser, updateUser, deleteUser } from '@/api/user'
import { getRoles, setUserRoleByUserName } from '@/api/role'
import { validEmail } from '@/utils/validate'
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
    var validatePass = (rule, value, callback) => {
      if (value === '' && this.dialogStatus === 'create') {
        callback(new Error('请输入密码'))
      } else {
        if (this.temp.passwordconfirm !== '') {
          this.$refs.dataForm.validateField('passwordconfirm')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '' && this.dialogStatus === 'create') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.temp.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      if (!validEmail(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
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
        user_name: '',
        nick_name: '',
        email: '',
        phone: '',
        password: '',
        passwordconfirm: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        user_name: [{ required: true, message: 'username is required', trigger: 'blur' }],
        nick_name: [{ required: true, message: 'nickname is required', trigger: 'blur' }],
        email: [{ required: true, trigger: 'blur', validator: validateEmail }],
        phone: [{ required: true, message: 'phone is required', trigger: 'blur' }],
        password: [{ validator: validatePass, trigger: 'blur' }],
        passwordconfirm: [{ validator: validatePass2, trigger: 'blur' }]
      },
      dialogRoleVisible: false,
      checkAll: false,
      checkedRoles: [],
      checkedAllRoles: [],
      allRoles: [],
      isIndeterminate: false,
      currentUserName: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getUsers(this.listQuery).then(response => {
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
        user_name: '',
        nick_name: '',
        email: '',
        phone: '',
        password: '',
        passwordconfirm: ''
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
          addUser(this.temp).then(() => {
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
          updateUser(tempData).then(() => {
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
        deleteUser({ id: row.id }).then(() => {
          this.getList()
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      })
    }, handleUpdateRole(row) {
      this.currentUserName = row.user_name
      getRoles({ limit: -1, username: row.user_name }).then(response => {
        this.allRoles = []
        this.checkedRoles = []
        this.checkedAllRoles = []
        response.data.items.forEach(item => {
          this.checkedAllRoles.push(item.role)
          if (item.name !== '') {
            this.allRoles.push(item)
          } else {
            item.name = item.role
            this.allRoles.push(item)
          }
        })
        response.data.role_items.forEach(item => {
          this.checkedRoles.push(item.role)
        })
        if (this.checkedRoles.length > 0) {
          this.checkAll = this.checkedRoles.length === this.allRoles.length
          this.isIndeterminate = !this.checkAll
        } else {
          this.isIndeterminate = false
          this.checkAll = false
        }
        this.dialogRoleVisible = true
      })
      // this.temp = Object.assign({}, row) // copy obj
    },
    handleCheckAllChange(val) {
      this.checkedRoles = val ? this.checkedAllRoles : []
      this.isIndeterminate = false
    },
    handleCheckedRolesChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.allRoles.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.allRoles.length
    },
    handleUpdateRoleRole() {
      setUserRoleByUserName({ username: this.currentUserName, roles: this.checkedRoles }).then(() => {
        this.currentUserName = ''
        this.dialogRoleVisible = false
      })
    }
  }
}
</script>

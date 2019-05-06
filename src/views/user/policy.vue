<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column label="权限路径" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.policy }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="300px" label="权限名称">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.name" class="edit-input" size="small" />
            <el-button class="cancel-btn" size="small" icon="el-icon-refresh" type="warning" @click="cancelEdit(row)">
              cancel
            </el-button>
          </template>
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="{row}">
          <el-button v-if="row.edit" type="success" size="small" icon="el-icon-circle-check-outline" @click="confirmEdit(row)">
            Ok
          </el-button>
          <el-button v-else type="primary" size="small" icon="el-icon-edit" @click="row.edit=!row.edit">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" :page-sizes="[10, 20, 30, 50]" @pagination="getList" />
  </div>
</template>

<script>
import { getPolicys, updatePolicy } from '@/api/policy'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'InlineEditTable',
  components: { Pagination },
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
      listLoading: true,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getPolicys(this.listQuery).then(response => {
        this.total = response.data.total
        this.list = response.data.items.map(v => {
          this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
          v.originalName = v.name //  will be used when user click the cancel botton
          return v
        })
        setTimeout(() => {
          this.listLoading = false
        }, 1 * 500)
      })
    },
    cancelEdit(row) {
      row.name = row.originalName
      row.edit = false
      // this.$message({
      //   message: 'The title has been restored to the original value',
      //   type: 'warning'
      // })
    },
    confirmEdit(row) {
      row.edit = false
      row.originalName = row.name
      updatePolicy(row).then(() => {
        console.log('123')
        this.$message({
          message: 'The title has been edited',
          type: 'success'
        })
      }).catch(() => {
        this.$message({
          message: '编辑失败',
          type: 'error'
        })
      })
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>

<template>
  <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f2f5">
    <el-card style="width:420px">
      <template #header>
        <div style="text-align:center;font-size:22px;font-weight:bold">央企公务用车管理系统</div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" :loading="loading" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
      <div style="text-align:center;color:#999;font-size:12px;line-height:1.8">
        <div>测试账号（密码均为 admin123）</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center;margin-top:4px;font-size:11px">
          <span v-for="acct in quickAccounts" :key="acct.user" style="cursor:pointer;color:#1a73e8;padding:2px 6px;border-radius:4px;background:#e8f0fe" @click="quickLogin(acct.user)">{{ acct.label }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: 'admin123'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const quickAccounts = [
  { label: '管理员 admin', user: 'admin' },
  { label: '员工 zhangsan', user: 'zhangsan' },
  { label: '负责人 lisi', user: 'lisi' },
  { label: '领导 wangwu', user: 'wangwu' },
  { label: '调度员 zhaoqian', user: 'zhaoqian' },
  { label: '司机 sunli', user: 'sunli' },
  { label: '纪检 zhouji', user: 'zhouji' },
  { label: '财务 wucai', user: 'wucai' },
]

function quickLogin(username) {
  form.username = username
  form.password = 'admin123'
  handleLogin()
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const res = await authStore.login(form.username, form.password)
    ElMessage.success(`欢迎，${res.user.real_name}`)
    router.push('/dashboard')
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

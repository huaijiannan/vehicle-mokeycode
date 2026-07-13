<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMobileStore } from '@/stores/mobile'
import { mobileLogin } from '@/api/mobile'
import { showToast } from 'vant'

const router = useRouter()
const store = useMobileStore()

const phone = ref('')
const password = ref('')
const loading = ref(false)

async function onLogin() {
  if (!phone.value || !password.value) {
    showToast('请输入手机号和密码')
    return
  }
  loading.value = true
  try {
    const res = await mobileLogin({ phone: phone.value, password: password.value })
    store.setToken(res.data.token)
    store.setUser(res.data.user)
    showToast('登录成功')
    router.push('/m/home')
  } catch (e) {
    showToast(e.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mobile-login">
    <div class="login-header">
      <div class="login-logo">
        <van-icon name="logistics" size="48" color="#1a73e8" />
      </div>
      <h1 class="login-title">公务用车管理</h1>
      <p class="login-subtitle">移动端轻量操作终端</p>
    </div>

    <van-form @submit="onLogin" class="login-form">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          :rules="[{ required: true, message: '请输入手机号' }]"
          left-icon="phone-o"
          maxlength="11"
          type="tel"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
          left-icon="lock"
        />
      </van-cell-group>
      <div class="login-btn-wrap">
        <van-button round block type="primary" native-type="submit" :loading="loading" loading-text="登录中...">
          登录
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
.mobile-login {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, #e8f0fe 0%, #f5f6f8 60%);
  padding: 40px 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  margin-top: 60px;
}

.login-logo {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(26,115,232,.15);
  margin-bottom: 16px;
}

.login-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.login-subtitle {
  font-size: 13px;
  color: #999;
}

.login-form {
  max-width: 360px;
  margin: 0 auto;
}

.login-btn-wrap {
  margin: 24px 16px 0;
}
</style>

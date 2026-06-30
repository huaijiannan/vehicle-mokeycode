<template>
  <el-container style="height:100vh">
    <el-aside width="220px" style="background:#304156;overflow-y:auto">
      <div style="height:60px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:bold;border-bottom:1px solid #4a5b6d">
        公务用车管理系统
      </div>
      <el-menu :default-active="route.path" background-color="#304156" text-color="#bfcbd9" active-text-color="#409eff" router>
        <el-menu-item index="/dashboard">
          <el-icon><svg viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M960 192a64 64 0 0 0-64-64H128a64 64 0 0 0-64 64v640a64 64 0 0 0 64 64h768a64 64 0 0 0 64-64V192z m-832 64h768v128H128V256z m256 192H128v192h256V448z m64 320H128v128h320V768z m64-384h384v384H512V384z m0 448h384v64H512v-64z" fill="currentColor"/></svg></el-icon>
          <span>系统仪表盘</span>
        </el-menu-item>
        <el-sub-menu index="vehicle">
          <template #title>
            <el-icon><svg viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M380.8 249.6c-44.8-19.2-96-25.6-140.8-19.2-83.2 12.8-147.2 70.4-166.4 153.6-12.8 64 12.8 128 57.6 172.8l48 48c12.8 12.8 19.2 32 12.8 51.2L160 768h320l-32-108.8c-6.4-19.2 0-38.4 12.8-51.2l48-48c44.8-44.8 70.4-108.8 57.6-172.8-19.2-83.2-83.2-140.8-166.4-153.6-44.8-6.4-83.2 0-121.6 19.2 12.8-6.4 19.2-12.8 32-19.2 6.4-25.6 12.8-44.8 25.6-64l64-70.4c6.4-6.4 6.4-19.2 0-25.6l-25.6-25.6c-6.4-6.4-19.2-6.4-25.6 0l-64 70.4c-12.8 12.8-25.6 25.6-38.4 38.4z m422.4 121.6c0-44.8-19.2-89.6-51.2-121.6l-25.6-25.6-44.8 51.2 25.6 25.6c25.6 25.6 38.4 57.6 38.4 89.6s-12.8 64-38.4 89.6l-25.6 25.6 44.8 51.2 25.6-25.6c32-44.8 51.2-96 51.2-140.8z m-230.4 0c0-89.6-70.4-160-160-160s-160 70.4-160 160c0 44.8 19.2 83.2 44.8 115.2l-96 102.4 217.6 217.6H864l-144-153.6 76.8-83.2c25.6-32 44.8-76.8 44.8-121.6zM512 480c-44.8 0-83.2-38.4-83.2-83.2s38.4-83.2 83.2-83.2 83.2 38.4 83.2 83.2S556.8 480 512 480z" fill="currentColor"/></svg></el-icon>
            <span>车辆管理</span>
          </template>
          <el-menu-item index="/vehicle/list">车辆档案</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/driver/list">
          <el-icon><svg viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384z m0 64c-128 0-384 64-384 192v64h768v-64c0-128-256-192-384-192z" fill="currentColor"/></svg></el-icon>
          <span>驾驶员管理</span>
        </el-menu-item>
        <el-menu-item index="/apply/list">
          <el-icon><svg viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32z m-40 728H184V184h656v656z M304 288h416v64H304z m0 128h416v64H304z m0 128h256v64H304z" fill="currentColor"/></svg></el-icon>
          <span>用车申请</span>
        </el-menu-item>
        <el-menu-item index="/approve/list">
          <el-icon><svg viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M699 353h-46.9c-10.2 0-19.9 4.9-25.9 13.3L469 584.3l-71.2-98.8c-6-8.3-15.6-13.3-25.9-13.3H325c-6.5 0-10.3 7.4-6.5 12.7l124.6 172.8a16.8 16.8 0 0 0 25.9 0l210.6-292c3.8-5.3 0-12.7-6.5-12.7z" fill="currentColor"/><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="currentColor"/></svg></el-icon>
          <span>用车审批</span>
        </el-menu-item>
        <el-menu-item index="/dispatch/list">
          <el-icon><svg viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M837.1 161.1C758.6 82.6 654 37 538.5 37 302.1 37 112 227.1 112 463.5c0 117.8 48.4 224.7 133.4 302.2L240 832h64L268.9 695.2c74.3 50.5 163.4 80.1 261.2 80.1 237.1 0 425-186 435.9-422.3 11.1-235.5-178.9-440.3-416-448.3z m-299.6 598.2c-144.1 0-260.9-116.9-260.9-260.9 0-144.1 116.9-260.9 260.9-260.9 144.1 0 260.9 116.9 260.9 260.9 0 144-116.9 260.9-260.9 260.9z" fill="currentColor"/><path d="M537.5 694.2c126.7 0 229.4-102.7 229.4-229.4S664.2 235.4 537.5 235.4 308.1 338.1 308.1 464.8s102.7 229.4 229.4 229.4z m0-408.8c99 0 179.4 80.4 179.4 179.4S636.5 644.2 537.5 644.2 358.1 563.8 358.1 464.8 438.5 285.4 537.5 285.4z" fill="currentColor"/><path d="M537.5 517.4l113.8-113.8-35.3-35.3-113.8 113.8L537.5 517.4z" fill="currentColor"/></svg></el-icon>
          <span>车辆调度</span>
        </el-menu-item>
        <el-menu-item index="/trip/list">
          <el-icon><svg viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M888 792H200V168c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h752c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z M320 536h164c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H320c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8z m0 124h325c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H320c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8z m0 124h245c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H320c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8z" fill="currentColor"/></svg></el-icon>
          <span>行程记录</span>
        </el-menu-item>
        <el-menu-item index="/expense/list">
          <el-icon><svg viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32z m-40 632H136V232h752v560z M610.8 476h62.4c20.7 0 37.7-14.5 40.7-33.8.5-3.3.5-7.2.5-3.7 0-3.3-0.1-16.5-0.1-20.4-3.1-19.6-19.9-34.1-40.7-34.1h-62.4c-22.1 0-40-17.9-40-40v-44.5c0-36.7 24.7-68.2 59.4-76.5V248h44v15.6c34.2 8.6 58.7 40.2 58.7 77.1V344h-44c0-19.9-15.2-36.2-34.3-39.5-2.1-0.4-4.3-0.5-6.5-0.5h-62.4c-20.7 0-37.7 14.5-40.7 33.8-0.5 3.3-0.5 7.2-0.5 3.7 0 3.3 0.1 16.5 0.1 20.4 3.1 19.6 19.9 34.1 40.7 34.1h62.4c22.1 0 40 17.9 40 40v44.5c0 36.7-24.7 68.2-59.4 76.5V776h-44v-15.6c-34.2-8.6-58.7-40.2-58.7-77.1V680h44c0 19.9 15.2 36.2 34.3 39.5 2.1 0.4 4.3 0.5 6.5 0.5h0.1z" fill="currentColor"/></svg></el-icon>
          <span>费用管理</span>
        </el-menu-item>
        <el-menu-item index="/report/dashboard">
          <el-icon><svg viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M128 128h768v768H128V128z m64 64v640h640V192H192z m128 128h384v64H320v-64z m0 128h256v64H320v-64z m0 128h384v64H320v-64z" fill="currentColor"/></svg></el-icon>
          <span>统计报表</span>
        </el-menu-item>
        <el-menu-item index="/system/users">
          <el-icon><svg viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M858.5 763.6c-18.9-44.8-46.1-85-80.6-119.5-34.5-34.5-74.7-61.7-119.5-80.6-.4 80.2-36.7 138.6-79.3 174.5-46.8 39.5-113.8 61.5-195 61.5-80.2 0-147.4-22.2-194.5-61.5-42.6-35.9-78.9-94.3-79.3-174.5-44.8 18.9-85 46.1-119.5 80.6-34.5 34.5-61.7 74.7-80.6 119.5C81.4 818.9 64 881.9 64 960h896c0-78.1-17.4-141.1-46.5-196.4z M512 576c159 0 288-129 288-288S671 0 512 0 224 129 224 288s129 288 288 288z" fill="currentColor"/></svg></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="height:50px;line-height:50px;border-bottom:1px solid #e6e6e6;display:flex;align-items:center;justify-content:flex-end;padding:0 20px;background:#fff">
        <el-dropdown trigger="click">
          <span style="cursor:pointer;display:flex;align-items:center;gap:6px">
            <el-icon><svg viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384z m0 64c-128 0-384 64-384 192v64h768v-64c0-128-256-192-384-192z" fill="currentColor"/></svg></el-icon>
            {{ userStore.user?.real_name || '管理员' }}
            <el-icon><svg viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3 0.1-12.7-6.4-12.7z" fill="currentColor"/></svg></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main style="background:#f0f2f5;overflow-y:auto">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const userStore = useAuthStore()

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

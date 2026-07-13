<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMobileStore } from '@/stores/mobile'
import { showToast } from 'vant'

const router = useRouter()
const store = useMobileStore()

const loading = ref(false)

const roleMap = {
  employee: { label: '普通员工' },
  approver: { label: '部门负责人' },
  dispatcher: { label: '调度员' },
  driver: { label: '驾驶员' },
  admin: { label: '管理员' }
}

const userInfo = computed(() => {
  const roleInfo = roleMap[store.role] || roleMap.employee
  return { label: roleInfo.label, name: store.user?.real_name || store.user?.username || roleInfo.label }
})

onMounted(() => {
  store.fetchDashboard()
  store.fetchNotifications()
  if (store.role === 'employee') store.fetchApplies()
  if (store.role === 'approver') store.fetchApproves()
  if (store.role === 'dispatcher') store.fetchDispatches()
  if (store.role === 'driver') store.fetchTasks()
})

function goApply() {
  router.push('/m/apply/create')
}

function goApplyDetail(id) {
  router.push(`/m/apply/${id}`)
}

function goDispatchAssign(id) {
  router.push(`/m/dispatch/assign/${id}`)
}

function goTaskStart(id) {
  router.push(`/m/task/${id}/start`)
}

function goTaskEnd(id) {
  router.push(`/m/task/${id}/end`)
}

function goExpenseCreate() {
  router.push('/m/expense/create')
}

function goRepairCreate() {
  router.push('/m/repair/create')
}

function goApproveList() {
  router.push('/m/approve/list')
}

function goDispatchList() {
  router.push('/m/dispatch/list')
}

function goMonitor() {
  router.push('/m/monitor')
}

function goVehicleStatus() {
  router.push('/m/vehicle/status')
}

function formatHomeTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const applyStatusTags = { '待审批': 'warning', '已审批': 'success', '已派车': 'primary', '已驳回': 'danger' }
</script>

<template>
  <div class="mobile-home">
    <div class="home-header">
      <div class="greeting">你好，{{ userInfo.name }}</div>
      <div class="role-tag">{{ userInfo.label }}</div>
    </div>

    <div class="home-body">
      <!-- 普通员工 -->
      <template v-if="store.role === 'employee'">
        <div class="apply-hero" @click="goApply">
          <span class="apply-plus">+</span>
          <span class="apply-text">申请用车</span>
        </div>
        <div class="section-title">我的申请</div>
        <div class="card" v-for="item in store.applies.slice(0, 3)" :key="item.id" @click="goApplyDetail(item.id)">
          <div class="card-row">
            <span class="card-title">{{ item.purpose }}</span>
            <van-tag :type="applyStatusTags[item.status] || 'default'" size="small">{{ item.status }}</van-tag>
          </div>
          <div class="card-meta">{{ formatHomeTime(item.depart_time) }} · {{ item.passenger_count }}人</div>
          <div class="card-route">{{ item.origin }} → {{ item.destination }}</div>
        </div>
        <van-empty v-if="store.applies.length === 0" description="暂无申请，点击上方按钮申请用车" />
      </template>

      <!-- 审批人 -->
      <template v-if="store.role === 'approver'">
        <div class="stat-grid-2">
          <div class="stat-card"><div class="stat-num warn">{{ store.dashboardData?.pending_approvals || 0 }}</div><div class="stat-label">待审批</div></div>
          <div class="stat-card"><div class="stat-num success">{{ store.dashboardData?.today_applies || 0 }}</div><div class="stat-label">今日申请</div></div>
        </div>
        <div class="section-title">待审批</div>
        <div class="card" v-for="item in store.approves.slice(0, 3)" :key="'a'+item.id">
          <div class="card-row">
            <span class="card-title">{{ item.purpose }}</span>
            <van-tag type="primary" size="small">待审批</van-tag>
          </div>
          <div class="card-meta">{{ item.applicant_name || '' }} · {{ item.department_name || '' }} · {{ formatHomeTime(item.depart_time) }}</div>
          <div class="card-route">{{ item.origin }} → {{ item.destination }} · {{ item.passenger_count }}人</div>
          <div class="card-actions">
            <van-button size="small" plain type="default" @click="$router.push('/m/approve/list')">去审批</van-button>
            <van-button size="small" type="primary" @click="goApproveList">查看全部</van-button>
          </div>
        </div>
        <van-empty v-if="store.approves.length === 0" description="暂无待审批申请" />
      </template>

      <!-- 调度员 -->
      <template v-if="store.role === 'dispatcher'">
        <div class="urgent-alert" @click="goDispatchList">
          <van-icon name="warning-o" size="20" color="#f5222d" />
          <span class="urgent-text">{{ store.dispatches.length }}条任务待处理</span>
          <van-icon name="arrow" color="#f5222d" />
        </div>
        <div class="stat-grid-3">
          <div class="stat-card"><div class="stat-num warn">{{ store.dashboardData?.pending_dispatches || 0 }}</div><div class="stat-label">待调度</div></div>
          <div class="stat-card"><div class="stat-num">{{ store.dashboardData?.active_trips || 0 }}</div><div class="stat-label">进行中</div></div>
          <div class="stat-card"><div class="stat-num success">{{ store.dashboardData?.completed_trips || 0 }}</div><div class="stat-label">已归库</div></div>
        </div>
        <div class="resource-row">
          <div class="resource-item"><span class="r-num green">{{ store.dashboardData?.idle_vehicles || 0 }}</span>空闲车辆</div>
          <div class="resource-item"><span class="r-num blue">-</span>空闲司机</div>
        </div>
        <div class="section-title">待调度任务</div>
        <div class="card" v-for="item in store.dispatches.slice(0, 3)" :key="'d'+item.id" @click="goDispatchAssign(item.id)">
          <div class="card-row">
            <span class="card-title">{{ item.purpose }}</span>
            <van-tag type="warning" size="small">待调度</van-tag>
          </div>
          <div class="card-meta">{{ item.applicant_name || '' }} · {{ formatHomeTime(item.depart_time) }} · {{ item.origin }}→{{ item.destination }}</div>
          <div class="card-actions">
            <span class="hint-green">空闲车{{ store.dashboardData?.idle_vehicles || 0 }}辆</span>
            <van-button size="small" type="primary" @click="goDispatchAssign(item.id)">派车</van-button>
          </div>
        </div>
        <van-empty v-if="store.dispatches.length === 0" description="暂无待调度任务" />
      </template>

      <!-- 驾驶员 -->
      <template v-if="store.role === 'driver'">
        <div class="section-title">进行中</div>
        <div class="active-task" v-if="store.tasks.find(t => t.status === '出车中')">
          <div class="task-time-label">出车时间</div>
          <div class="task-time">{{ formatHomeTime(store.tasks.find(t => t.status === '出车中').start_time) }}</div>
          <div class="task-route">{{ store.tasks.find(t => t.status === '出车中').origin || '-' }} → {{ store.tasks.find(t => t.status === '出车中').destination || '-' }}</div>
          <div class="task-vehicle">{{ store.tasks.find(t => t.status === '出车中').plate_number }} · {{ store.tasks.find(t => t.status === '出车中').brand_model }}</div>
          <div class="task-btns">
            <van-button size="small" plain type="default" @click="goExpenseCreate">费用记入</van-button>
            <van-button size="small" type="primary" @click="goTaskEnd(store.tasks.find(t => t.status === '出车中').id)">确认归库</van-button>
          </div>
        </div>
        <div class="section-title">待执行 ({{ store.tasks.filter(t => t.status === '待出车').length }})</div>
        <div class="card" v-for="item in store.tasks.filter(t => t.status === '待出车').slice(0, 3)" :key="'t'+item.id">
          <div class="card-row">
            <span class="card-title">{{ item.purpose }}</span>
            <van-tag type="primary" size="small">待执行</van-tag>
          </div>
          <div class="card-meta">{{ formatHomeTime(item.depart_time) }} · {{ item.plate_number }}</div>
          <div class="card-route">{{ item.origin || '-' }} → {{ item.destination || '-' }} · {{ item.passenger_count || 0 }}人</div>
          <div class="card-actions">
            <span class="card-hint">车辆：{{ item.brand_model || '-' }}</span>
            <van-button size="small" type="primary" @click="goTaskStart(item.id)">确认出车</van-button>
          </div>
        </div>
        <van-empty v-if="store.tasks.length === 0" description="暂无任务" />
      </template>

      <!-- 管理员 -->
      <template v-if="store.role === 'admin'">
        <div class="section-title">今日运营概览</div>
        <div class="stat-grid-4">
          <div class="stat-card"><div class="stat-num">{{ store.dashboardData?.today_applies || 0 }}</div><div class="stat-label">申请数</div></div>
          <div class="stat-card"><div class="stat-num warn">{{ store.dashboardData?.active_trips || 0 }}</div><div class="stat-label">在途</div></div>
          <div class="stat-card"><div class="stat-num success">{{ store.dashboardData?.completed_trips || 0 }}</div><div class="stat-label">已完成</div></div>
          <div class="stat-card"><div class="stat-num">{{ store.dashboardData?.idle_vehicles || 0 }}</div><div class="stat-label">空闲车辆</div></div>
        </div>
        <div class="section-title">车辆状态分布</div>
        <div class="status-bar-chart">
          <div class="bar-seg" :style="{ width: (store.dashboardData?.idle_vehicles / store.dashboardData?.total_vehicles * 100 || 0) + '%', background: '#52c41a' }">空闲 {{ store.dashboardData?.idle_vehicles || 0 }}辆</div>
          <div class="bar-seg" :style="{ width: (store.dashboardData?.in_use_vehicles / store.dashboardData?.total_vehicles * 100 || 0) + '%', background: '#1a73e8' }">在途 {{ store.dashboardData?.in_use_vehicles || 0 }}辆</div>
          <div class="bar-seg" :style="{ width: (store.dashboardData?.maintenance_vehicles / store.dashboardData?.total_vehicles * 100 || 0) + '%', background: '#fa8c16' }">维修 {{ store.dashboardData?.maintenance_vehicles || 0 }}辆</div>
          <div class="bar-seg" :style="{ width: (store.dashboardData?.inactive_vehicles / store.dashboardData?.total_vehicles * 100 || 0) + '%', background: '#e8e8e8' }">停用 {{ store.dashboardData?.inactive_vehicles || 0 }}辆</div>
        </div>
        <div class="section-title">快捷入口</div>
        <div class="stat-grid-3">
          <div class="stat-card" @click="goDispatchList"><van-icon name="logistics" size="22" color="#1a73e8" /><div class="stat-label">调度管理</div></div>
          <div class="stat-card" @click="goVehicleStatus"><van-icon name="guide-o" size="22" color="#52c41a" /><div class="stat-label">车辆状态</div></div>
          <div class="stat-card" @click="goMonitor"><van-icon name="chart-trending-o" size="22" color="#fa8c16" /><div class="stat-label">监控看板</div></div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.mobile-home {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f5f6f8;
}

.home-header {
  background: #fff;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.greeting {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.role-tag {
  font-size: 12px;
  color: #1a73e8;
  background: #e8f0fe;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.home-body {
  padding: 12px 16px;
}

.apply-hero {
  background: linear-gradient(135deg, #1a73e8, #4080ff);
  color: #fff;
  border-radius: 14px;
  padding: 24px;
  text-align: center;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(26,115,232,.3);
  cursor: pointer;
}

.apply-plus {
  font-size: 32px;
  display: block;
  font-weight: 300;
  line-height: 1;
  margin-bottom: 4px;
}

.apply-text {
  font-size: 17px;
  font-weight: 700;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  margin-top: 8px;
  padding-left: 6px;
  border-left: 3px solid #1a73e8;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  border-left: 3px solid #e8e8e8;
}

.card.urgent {
  border-left-color: #f5222d;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.card-meta {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.card-route {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}

.card-actions .van-button + .van-button {
  margin-left: 8px;
}

.card-hint {
  font-size: 11px;
  color: #999;
}

.hint-green {
  font-size: 11px;
  color: #52c41a;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.stat-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.stat-grid-4 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0,0,0,.04);
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #1a73e8;
}

.stat-num.warn { color: #fa8c16; }
.stat-num.success { color: #52c41a; }
.stat-num.danger { color: #f5222d; }

.stat-label {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.resource-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.resource-item {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
  box-shadow: 0 1px 2px rgba(0,0,0,.04);
}

.r-num {
  font-size: 20px;
  font-weight: 700;
}

.r-num.green { color: #52c41a; }
.r-num.blue { color: #1a73e8; }

.urgent-alert {
  background: linear-gradient(135deg, #fff1f0, #fff);
  border: 1px solid #ffccc7;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  cursor: pointer;
}

.urgent-text {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #cf1322;
}

.active-task {
  background: linear-gradient(135deg, #1a73e8, #4080ff);
  color: #fff;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 16px;
}

.task-time-label {
  font-size: 11px;
  opacity: .8;
}

.task-time {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.task-route {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 2px;
}

.task-vehicle {
  font-size: 13px;
  opacity: .9;
}

.task-btns {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.task-btns .van-button--default {
  --van-button-default-color: #fff;
  --van-button-default-border-color: rgba(255,255,255,.4);
  background: rgba(255,255,255,.2);
}

.status-bar-chart {
  display: flex;
  height: 28px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
}

.bar-seg {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,.04);
}

.alert-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f5222d;
  flex-shrink: 0;
}

.alert-info {
  flex: 1;
}

.alert-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.alert-desc {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.alert-time {
  font-size: 11px;
  color: #999;
}
</style>

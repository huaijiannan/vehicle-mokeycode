<template>
  <div>
    <div
      :class="['tree-row', { active: store.selectedOrgId === String(node.id) }]"
      :style="{ paddingLeft: (16 + level * 16) + 'px' }"
      @click="handleClick"
    >
      <span v-if="hasChildren" :class="['arrow', { expanded: isExpanded }]">&#9654;</span>
      <span v-else style="width:16px;flex-shrink:0"></span>
      <span style="font-size:14px">{{ level === 1 ? '🏢' : '📋' }}</span>
      <span class="tree-name">{{ node.name }}</span>
      <span v-if="node.vehicleCount" class="tree-count">{{ node.vehicleCount }}</span>
    </div>
    <div v-if="hasChildren && isExpanded">
      <OrgTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useOperationsStore } from '@/stores/operations'

const props = defineProps({
  node: { type: Object, required: true },
  level: { type: Number, default: 0 }
})

const store = useOperationsStore()

const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
const isExpanded = computed(() => store.expandedOrgNodes.has(String(props.node.id)))

function handleClick() {
  if (hasChildren.value) {
    const id = String(props.node.id)
    const newSet = new Set(store.expandedOrgNodes)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    store.expandedOrgNodes = newSet
  }
  store.selectOrg(String(props.node.id))
}
</script>

<style scoped>
.tree-row {
  display:flex;align-items:center;padding:6px 16px;cursor:pointer;font-size:13px;color:#333;transition:background .12s;gap:6px;user-select:none;
}
.tree-row:hover { background:#f5f8ff; }
.tree-row.active { background:#e6f4ff;color:#1677ff;font-weight:600; }
.tree-name { flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.tree-count { font-size:11px;color:#999;background:#f5f5f5;padding:1px 7px;border-radius:10px; }
.tree-row.active .tree-count { background:#bae0ff;color:#1677ff; }
.arrow { width:16px;font-size:10px;color:#999;flex-shrink:0;text-align:center;transition:transform .15s;display:inline-block; }
.arrow.expanded { transform:rotate(90deg); }
</style>

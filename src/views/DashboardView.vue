<script setup>
import { computed } from 'vue'
import { useMembersStore } from '../stores/members'
import { useProductsStore } from '../stores/products'

const members = useMembersStore()
const products = useProductsStore()

const stats = computed(() => [
  { label: '会员数', value: members.members.length },
  {
    label: '会员总余额',
    value: `¥${members.members.reduce((s, m) => s + Number(m.balance || 0), 0).toFixed(2)}`,
  },
  { label: '产品数', value: products.products.length },
  { label: '已上架', value: products.onShelfCount },
])
</script>

<template>
  <section>
    <header class="page-head">
      <div>
        <h1>概览</h1>
        <p>Vue3 后台演示：登录注册、会员、余额、产品上架（本地存储，无后端）</p>
      </div>
    </header>
    <div class="stats">
      <article v-for="item in stats" :key="item.label" class="stat panel">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </div>
  </section>
</template>

<style scoped>
.page-head h1 {
  margin: 0 0 0.35rem;
}

.page-head p {
  margin: 0 0 1.25rem;
  color: var(--muted);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.stat span {
  color: var(--muted);
  font-size: 0.9rem;
}

.stat strong {
  font-size: 1.6rem;
}

@media (max-width: 900px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

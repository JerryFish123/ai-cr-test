<script setup>
import { computed } from 'vue'
import { useMembersStore } from '../stores/members'
import { useProductsStore } from '../stores/products'
import { useBannersStore } from '../stores/banners'
import { useMerchantsStore } from '../stores/merchants'

const members = useMembersStore()
const products = useProductsStore()
const banners = useBannersStore()
const merchants = useMerchantsStore()

const stats = computed(() => [
  { label: '会员数', value: members.members.length },
  { label: '产品已上架', value: products.onShelfCount },
  { label: '启用 Banner', value: banners.enabledCount },
  { label: '营业商家', value: merchants.activeMerchantCount },
  { label: 'SKU 总数', value: merchants.skus.length },
  {
    label: '会员总余额',
    value: `¥${members.members.reduce((s, m) => s + Number(m.balance || 0), 0).toFixed(2)}`,
  },
])
</script>

<template>
  <section>
    <header class="page-head">
      <div>
        <h1>概览</h1>
        <p>0723：Banner 本地上传、商家/SKU 管理已接入（本地存储，无后端）</p>
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

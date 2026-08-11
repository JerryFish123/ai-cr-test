<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMerchantsStore } from '../stores/merchants'

const store = useMerchantsStore()
const router = useRouter()
const error = ref('')
const editing = ref(null)
const form = reactive({
  id: '',
  name: '',
  contact: '',
  phone: '',
  status: 'active',
  remark: '',
})

function openCreate() {
  error.value = ''
  editing.value = 'create'
  Object.assign(form, {
    id: '',
    name: '',
    contact: '',
    phone: '',
    status: 'active',
    remark: '',
  })
}

function openEdit(item) {
  error.value = ''
  editing.value = 'edit'
  Object.assign(form, {
    id: item.id,
    name: item.name,
    contact: item.contact,
    phone: item.phone,
    status: item.status,
    remark: item.remark,
  })
}

function submit() {
  error.value = ''
  try {
    store.upsertMerchant({ ...form })
    editing.value = null
  } catch (e) {
    error.value = e.message
  }
}

function remove(item) {
  const count = store.skuCountOf(item.id)
  const tip =
    count > 0
      ? `商家「${item.name}」下还有 ${count} 个 SKU，将一并删除。确认吗？`
      : `确认删除商家「${item.name}」？`
  if (!confirm(tip)) return
  store.removeMerchant(item.id)
}

function goSkus(item) {
  router.push(`/merchants/${item.id}/skus`)
}

function formatTime(ts) {
  return new Date(ts).toLocaleString()
}
</script>

<template>
  <section>
    <div class="toolbar">
      <div>
        <h1>商家管理</h1>
        <p class="sub">管理商家主体；进入详情维护 SKU（停用商家会自动下架其 SKU）</p>
      </div>
      <button class="btn" type="button" @click="openCreate">新建商家</button>
    </div>

    <div v-if="error && !editing" class="error">{{ error }}</div>

    <div class="table-wrap panel" style="padding: 0">
      <table>
        <thead>
          <tr>
            <th>商家</th>
            <th>联系人</th>
            <th>状态</th>
            <th>SKU 数</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in store.merchants" :key="m.id">
            <td>
              <div class="name">{{ m.name }}</div>
              <div class="desc">{{ m.remark || '—' }}</div>
            </td>
            <td>{{ m.contact || '—' }} / {{ m.phone || '—' }}</td>
            <td>
              <span class="badge" :class="m.status === 'active' ? 'on' : 'off'">
                {{ m.status === 'active' ? '营业中' : '已停用' }}
              </span>
            </td>
            <td>{{ store.skuCountOf(m.id) }}</td>
            <td>{{ formatTime(m.updatedAt) }}</td>
            <td>
              <div class="actions">
                <button class="btn sm" type="button" @click="goSkus(m)">SKU</button>
                <button class="btn sm ghost" type="button" @click="openEdit(m)">编辑</button>
                <button
                  class="btn sm ghost"
                  type="button"
                  @click="store.setMerchantStatus(m.id, m.status === 'active' ? 'inactive' : 'active')"
                >
                  {{ m.status === 'active' ? '停用' : '启用' }}
                </button>
                <button class="btn sm danger" type="button" @click="remove(m)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!store.merchants.length" class="empty">暂无商家</div>
    </div>

    <div v-if="editing" class="modal-mask" @click.self="editing = null">
      <div class="modal">
        <h3>{{ editing === 'create' ? '新建商家' : '编辑商家' }}</h3>
        <div v-if="error" class="error">{{ error }}</div>
        <div class="field">
          <label>商家名称</label>
          <input v-model="form.name" />
        </div>
        <div class="field">
          <label>联系人</label>
          <input v-model="form.contact" />
        </div>
        <div class="field">
          <label>电话</label>
          <input v-model="form.phone" />
        </div>
        <div class="field">
          <label>状态</label>
          <select v-model="form.status">
            <option value="active">营业中</option>
            <option value="inactive">已停用</option>
          </select>
        </div>
        <div class="field">
          <label>备注</label>
          <textarea v-model="form.remark" rows="2" />
        </div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" @click="editing = null">取消</button>
          <button class="btn" type="button" @click="submit">保存</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
h1 {
  margin: 0;
}
.sub {
  margin: 0.25rem 0 0;
  color: var(--muted);
}
.name {
  font-weight: 600;
}
.desc {
  color: var(--muted);
  font-size: 0.85rem;
  margin-top: 0.2rem;
}
</style>

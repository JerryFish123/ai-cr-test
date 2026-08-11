<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMerchantsStore } from '../stores/merchants'

const route = useRoute()
const router = useRouter()
const store = useMerchantsStore()

const merchantId = computed(() => String(route.params.id || ''))
const merchant = computed(() => store.getMerchant(merchantId.value))
const list = computed(() => store.skusOf(merchantId.value))

const error = ref('')
const editing = ref(null)
const form = reactive({
  id: '',
  name: '',
  skuCode: '',
  price: 0,
  stock: 0,
  status: 'on',
})

function openCreate() {
  error.value = ''
  editing.value = 'create'
  Object.assign(form, {
    id: '',
    name: '',
    skuCode: '',
    price: 0,
    stock: 0,
    status: merchant.value?.status === 'active' ? 'on' : 'off',
  })
}

function openEdit(item) {
  error.value = ''
  editing.value = 'edit'
  Object.assign(form, {
    id: item.id,
    name: item.name,
    skuCode: item.skuCode,
    price: item.price,
    stock: item.stock,
    status: item.status,
  })
}

function submit() {
  error.value = ''
  try {
    store.upsertSku({
      ...form,
      merchantId: merchantId.value,
      stock: Number(form.stock),
    })
    editing.value = null
  } catch (e) {
    error.value = e.message
  }
}

function remove(item) {
  if (!confirm(`确认删除 SKU「${item.name}」？`)) return
  store.removeSku(item.id)
}

function toggleShelf(item) {
  error.value = ''
  try {
    store.setSkuShelf(item.id, item.status !== 'on')
  } catch (e) {
    error.value = e.message
  }
}

function formatTime(ts) {
  return new Date(ts).toLocaleString()
}
</script>

<template>
  <section>
    <div class="toolbar">
      <div>
        <button class="btn ghost sm" type="button" @click="router.push('/merchants')">← 返回商家</button>
        <h1 v-if="merchant">{{ merchant.name }} · SKU</h1>
        <h1 v-else>商家不存在</h1>
        <p v-if="merchant" class="sub">
          商家状态：{{ merchant.status === 'active' ? '营业中' : '已停用' }}
          （停用商家时禁止上架 SKU）
        </p>
      </div>
      <button v-if="merchant" class="btn" type="button" @click="openCreate">新建 SKU</button>
    </div>

    <div v-if="!merchant" class="panel empty">未找到该商家，请返回列表重试。</div>

    <template v-else>
      <div v-if="error && !editing" class="error">{{ error }}</div>
      <div class="table-wrap panel" style="padding: 0">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>编码</th>
              <th>价格</th>
              <th>库存</th>
              <th>状态</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in list" :key="s.id">
              <td>{{ s.name }}</td>
              <td>{{ s.skuCode }}</td>
              <td>¥{{ Number(s.price).toFixed(2) }}</td>
              <td>{{ s.stock }}</td>
              <td>
                <span class="badge" :class="s.status === 'on' ? 'on' : 'off'">
                  {{ s.status === 'on' ? '已上架' : '已下架' }}
                </span>
              </td>
              <td>{{ formatTime(s.updatedAt) }}</td>
              <td>
                <div class="actions">
                  <button class="btn sm ghost" type="button" @click="openEdit(s)">编辑</button>
                  <button class="btn sm" type="button" @click="toggleShelf(s)">
                    {{ s.status === 'on' ? '下架' : '上架' }}
                  </button>
                  <button class="btn sm danger" type="button" @click="remove(s)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!list.length" class="empty">暂无 SKU</div>
      </div>
    </template>

    <div v-if="editing" class="modal-mask" @click.self="editing = null">
      <div class="modal">
        <h3>{{ editing === 'create' ? '新建 SKU' : '编辑 SKU' }}</h3>
        <div v-if="error" class="error">{{ error }}</div>
        <div class="field">
          <label>名称</label>
          <input v-model="form.name" />
        </div>
        <div class="field">
          <label>SKU 编码</label>
          <input v-model="form.skuCode" />
        </div>
        <div class="field">
          <label>价格</label>
          <input v-model.number="form.price" type="number" min="0" step="0.01" />
        </div>
        <div class="field">
          <label>库存</label>
          <input v-model.number="form.stock" type="number" min="0" step="1" />
        </div>
        <div class="field">
          <label>状态</label>
          <select v-model="form.status">
            <option value="on">上架</option>
            <option value="off">下架</option>
          </select>
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
  margin: 0.55rem 0 0;
}
.sub {
  margin: 0.25rem 0 0;
  color: var(--muted);
}
</style>

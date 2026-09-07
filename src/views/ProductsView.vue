<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useProductsStore } from '../stores/products'

const store = useProductsStore()
const error = ref('')
const page = ref(1)
const pageSize = ref(10)

const total = computed(() => store.products.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const paginatedProducts = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return store.products.slice(start, start + pageSize.value)
})

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
})

function goPage(p) {
  if (p >= 1 && p <= totalPages.value) page.value = p
}
const editing = ref(null)
const form = reactive({
  id: '',
  name: '',
  price: 0,
  stock: 0,
  desc: '',
  status: 'on',
})

function openCreate() {
  error.value = ''
  editing.value = 'create'
  Object.assign(form, { id: '', name: '', price: 0, stock: 0, desc: '', status: 'on' })
}

function openEdit(product) {
  error.value = ''
  editing.value = 'edit'
  Object.assign(form, {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    desc: product.desc,
    status: product.status,
  })
}

function submit() {
  error.value = ''
  try {
    const isCreate = editing.value === 'create'
    store.upsertProduct({ ...form })
    if (isCreate) page.value = 1
    editing.value = null
  } catch (e) {
    error.value = e.message
  }
}

function toggleShelf(product) {
  store.setShelf(product.id, product.status !== 'on')
}

function removeProduct(product) {
  if (!confirm(`确认删除产品「${product.name}」？`)) return
  store.removeProduct(product.id)
}

function formatTime(ts) {
  return new Date(ts).toLocaleString()
}
</script>

<template>
  <section>
    <div class="toolbar">
      <div>
        <h1>产品管理</h1>
        <p class="sub">新建 / 编辑产品，并支持上架、下架（暂无后端）</p>
      </div>
      <button class="btn" type="button" @click="openCreate">新建产品</button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="table-wrap panel" style="padding: 0">
      <table>
        <thead>
          <tr>
            <th>产品</th>
            <th>价格</th>
            <th>库存</th>
            <th>状态</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in paginatedProducts" :key="p.id">
            <td>
              <div class="name">{{ p.name }}</div>
              <div class="desc">{{ p.desc || '—' }}</div>
            </td>
            <td>¥{{ Number(p.price).toFixed(2) }}</td>
            <td>{{ p.stock }}</td>
            <td>
              <span class="badge" :class="p.status === 'on' ? 'on' : 'off'">
                {{ p.status === 'on' ? '已上架' : '已下架' }}
              </span>
            </td>
            <td>{{ formatTime(p.updatedAt) }}</td>
            <td>
              <div class="actions">
                <button class="btn sm ghost" type="button" @click="openEdit(p)">编辑</button>
                <button class="btn sm" type="button" @click="toggleShelf(p)">
                  {{ p.status === 'on' ? '下架' : '上架' }}
                </button>
                <button class="btn sm danger" type="button" @click="removeProduct(p)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!store.products.length" class="empty">暂无产品</div>
      <div v-else-if="totalPages > 1" class="pagination">
        <span class="pagination-info">
          共 {{ total }} 条，第 {{ page }} / {{ totalPages }} 页
        </span>
        <div class="pagination-actions">
          <button
            class="btn sm ghost"
            type="button"
            :disabled="page <= 1"
            @click="goPage(page - 1)"
          >
            上一页
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            class="btn sm"
            :class="{ ghost: p !== page }"
            type="button"
            @click="goPage(p)"
          >
            {{ p }}
          </button>
          <button
            class="btn sm ghost"
            type="button"
            :disabled="page >= totalPages"
            @click="goPage(page + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <div v-if="editing" class="modal-mask" @click.self="editing = null">
      <div class="modal">
        <h3>{{ editing === 'create' ? '新建产品' : '编辑产品' }}</h3>
        <div class="field">
          <label>名称</label>
          <input v-model="form.name" />
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
          <label>描述</label>
          <textarea v-model="form.desc" rows="3" />
        </div>
        <div class="field">
          <label>上架状态</label>
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

.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--line);
}

.pagination-info {
  color: var(--muted);
  font-size: 0.875rem;
}

.pagination-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.pagination-actions .btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>

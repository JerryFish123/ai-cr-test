<script setup>
import { reactive, ref } from 'vue'
import { useProductsStore } from '../stores/products'

const store = useProductsStore()
const error = ref('')
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
    store.upsertProduct({ ...form })
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
          <tr v-for="p in store.products" :key="p.id">
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
</style>

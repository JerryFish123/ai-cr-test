<script setup>
import { reactive, ref } from 'vue'
import { useBannersStore } from '../stores/banners'

const store = useBannersStore()
const error = ref('')
const editing = ref(null)
const form = reactive({
  id: '',
  title: '',
  imageData: '',
  linkUrl: '',
  sort: 0,
  enabled: true,
})

function openCreate() {
  error.value = ''
  editing.value = 'create'
  Object.assign(form, {
    id: '',
    title: '',
    imageData: '',
    linkUrl: '',
    sort: 0,
    enabled: true,
  })
}

function openEdit(item) {
  error.value = ''
  editing.value = 'edit'
  Object.assign(form, {
    id: item.id,
    title: item.title,
    imageData: item.imageData,
    linkUrl: item.linkUrl,
    sort: item.sort,
    enabled: item.enabled,
  })
}

async function onPickFile(e) {
  error.value = ''
  const file = e.target.files?.[0]
  if (!file) return
  try {
    form.imageData = await store.uploadLocalImage(file)
  } catch (err) {
    error.value = err.message
    e.target.value = ''
  }
}

function submit() {
  error.value = ''
  try {
    store.upsert({ ...form })
    editing.value = null
  } catch (err) {
    error.value = err.message
  }
}

function remove(item) {
  if (!confirm(`确认删除 Banner「${item.title}」？`)) return
  store.remove(item.id)
}

function formatTime(ts) {
  return new Date(ts).toLocaleString()
}
</script>

<template>
  <section>
    <div class="toolbar">
      <div>
        <h1>Banner 管理</h1>
        <p class="sub">支持本地上传图片（PNG/JPEG/WebP，≤2MB），数据存浏览器本地</p>
      </div>
      <button class="btn" type="button" @click="openCreate">新建 Banner</button>
    </div>

    <div v-if="error && !editing" class="error">{{ error }}</div>

    <div class="table-wrap panel" style="padding: 0">
      <table>
        <thead>
          <tr>
            <th>预览</th>
            <th>标题</th>
            <th>排序</th>
            <th>状态</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in store.sorted" :key="b.id">
            <td>
              <div class="thumb">
                <img v-if="b.imageData" :src="b.imageData" :alt="b.title" />
                <span v-else class="noimg">无图</span>
              </div>
            </td>
            <td>
              <div class="name">{{ b.title }}</div>
              <div class="desc">{{ b.linkUrl || '无跳转链接' }}</div>
            </td>
            <td>{{ b.sort }}</td>
            <td>
              <span class="badge" :class="b.enabled ? 'on' : 'off'">
                {{ b.enabled ? '启用' : '停用' }}
              </span>
            </td>
            <td>{{ formatTime(b.updatedAt) }}</td>
            <td>
              <div class="actions">
                <button class="btn sm ghost" type="button" @click="openEdit(b)">编辑</button>
                <button class="btn sm" type="button" @click="store.setEnabled(b.id, !b.enabled)">
                  {{ b.enabled ? '停用' : '启用' }}
                </button>
                <button class="btn sm danger" type="button" @click="remove(b)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!store.banners.length" class="empty">暂无 Banner</div>
    </div>

    <div v-if="editing" class="modal-mask" @click.self="editing = null">
      <div class="modal wide">
        <h3>{{ editing === 'create' ? '新建 Banner' : '编辑 Banner' }}</h3>
        <div v-if="error" class="error">{{ error }}</div>
        <div class="field">
          <label>标题</label>
          <input v-model="form.title" maxlength="40" />
        </div>
        <div class="field">
          <label>本地上传图片</label>
          <input type="file" accept="image/png,image/jpeg,image/webp" @change="onPickFile" />
        </div>
        <div v-if="form.imageData" class="preview">
          <img :src="form.imageData" alt="preview" />
        </div>
        <div class="field">
          <label>跳转链接（可选）</label>
          <input v-model="form.linkUrl" placeholder="https://" />
        </div>
        <div class="field">
          <label>排序（越小越靠前）</label>
          <input v-model.number="form.sort" type="number" />
        </div>
        <div class="field">
          <label>状态</label>
          <select v-model="form.enabled">
            <option :value="true">启用</option>
            <option :value="false">停用</option>
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
.thumb {
  width: 72px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  background: #0c1117;
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.noimg {
  color: var(--muted);
  font-size: 0.75rem;
}
.preview {
  margin-bottom: 0.9rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  max-height: 180px;
}
.preview img {
  display: block;
  width: 100%;
  max-height: 180px;
  object-fit: contain;
  background: #0c1117;
}
.modal.wide {
  width: min(520px, 100%);
}
</style>

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const KEY = 'prdemotest_banners'
const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp'])

function seed() {
  return [
    {
      id: 'b_1',
      title: '春季会员活动',
      imageData: '',
      linkUrl: 'https://example.com/spring',
      sort: 1,
      enabled: true,
      updatedAt: Date.now() - 86400000,
    },
  ]
}

function load() {
  const raw = localStorage.getItem(KEY)
  if (raw) return JSON.parse(raw)
  const data = seed()
  localStorage.setItem(KEY, JSON.stringify(data))
  return data
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!ALLOWED.has(file.type)) {
      reject(new Error('仅支持 PNG / JPEG / WebP'))
      return
    }
    if (file.size > MAX_BYTES) {
      reject(new Error('图片不能超过 2MB'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取本地图片失败'))
    reader.readAsDataURL(file)
  })
}

export const useBannersStore = defineStore('banners', () => {
  const banners = ref(load())
  const enabledCount = computed(() => banners.value.filter((b) => b.enabled).length)

  function upsert(payload) {
    const title = payload.title?.trim()
    if (!title) throw new Error('请填写 Banner 标题')
    if (title.length > 40) throw new Error('标题不能超过 40 字')
    if (!payload.imageData) throw new Error('请上传 Banner 图片')
    const sort = Number(payload.sort)
    if (Number.isNaN(sort)) throw new Error('排序值不合法')

    if (payload.id) {
      banners.value = banners.value.map((b) =>
        b.id === payload.id
          ? {
              ...b,
              title,
              imageData: payload.imageData,
              linkUrl: payload.linkUrl?.trim() || '',
              sort,
              enabled: Boolean(payload.enabled),
              updatedAt: Date.now(),
            }
          : b,
      )
    } else {
      banners.value = [
        {
          id: `b_${Date.now()}`,
          title,
          imageData: payload.imageData,
          linkUrl: payload.linkUrl?.trim() || '',
          sort,
          enabled: payload.enabled !== false,
          updatedAt: Date.now(),
        },
        ...banners.value,
      ]
    }
    try {
      save(banners.value)
    } catch {
      throw new Error('本地存储不足，请删除部分 Banner 或换更小的图片')
    }
  }

  function remove(id) {
    banners.value = banners.value.filter((b) => b.id !== id)
    save(banners.value)
  }

  function setEnabled(id, enabled) {
    banners.value = banners.value.map((b) =>
      b.id === id ? { ...b, enabled: Boolean(enabled), updatedAt: Date.now() } : b,
    )
    save(banners.value)
  }

  async function uploadLocalImage(file) {
    return readFileAsDataUrl(file)
  }

  const sorted = computed(() =>
    [...banners.value].sort((a, b) => Number(a.sort) - Number(b.sort)),
  )

  return { banners, sorted, enabledCount, upsert, remove, setEnabled, uploadLocalImage }
})

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const KEY = 'prdemotest_products'

function seed() {
  return [
    {
      id: 'p_1',
      name: '季度会员卡',
      price: 99,
      stock: 200,
      status: 'on',
      desc: '90 天会员权益',
      updatedAt: Date.now() - 3600000,
    },
    {
      id: 'p_2',
      name: '年度会员卡',
      price: 299,
      stock: 80,
      status: 'on',
      desc: '365 天会员权益',
      updatedAt: Date.now() - 7200000,
    },
    {
      id: 'p_3',
      name: '体验礼包',
      price: 19.9,
      stock: 0,
      status: 'off',
      desc: '新用户体验包（已下架）',
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

export const useProductsStore = defineStore('products', () => {
  const products = ref(load())
  const onShelfCount = computed(() => products.value.filter((p) => p.status === 'on').length)

  function upsertProduct(payload) {
    const name = payload.name?.trim()
    const price = Number(payload.price)
    const stock = Number(payload.stock)
    if (!name) throw new Error('请填写产品名称')
    if (Number.isNaN(price) || price < 0) throw new Error('价格不合法')
    if (Number.isNaN(stock) || stock < 0) throw new Error('库存不合法')

    if (payload.id) {
      products.value = products.value.map((p) =>
        p.id === payload.id
          ? {
              ...p,
              name,
              price,
              stock,
              desc: payload.desc?.trim() || '',
              status: payload.status === 'on' ? 'on' : 'off',
              updatedAt: Date.now(),
            }
          : p,
      )
    } else {
      products.value = [
        {
          id: `p_${Date.now()}`,
          name,
          price,
          stock,
          desc: payload.desc?.trim() || '',
          status: payload.status === 'on' ? 'on' : 'off',
          updatedAt: Date.now(),
        },
        ...products.value,
      ]
    }
    save(products.value)
  }

  function removeProduct(id) {
    products.value = products.value.filter((p) => p.id !== id)
    save(products.value)
  }

  function setShelf(id, on) {
    products.value = products.value.map((p) =>
      p.id === id ? { ...p, status: on ? 'on' : 'off', updatedAt: Date.now() } : p,
    )
    save(products.value)
  }

  return { products, onShelfCount, upsertProduct, removeProduct, setShelf }
})

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const MERCHANT_KEY = 'prdemotest_merchants'
const SKU_KEY = 'prdemotest_skus'

function seedMerchants() {
  return [
    {
      id: 'mc_1',
      name: '星河优选商行',
      contact: '陈经理',
      phone: '13600001111',
      status: 'active',
      remark: '示例商家',
      updatedAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'mc_2',
      name: '青禾生鲜',
      contact: '刘店长',
      phone: '13600002222',
      status: 'inactive',
      remark: '已停用示例',
      updatedAt: Date.now() - 86400000,
    },
  ]
}

function seedSkus() {
  return [
    {
      id: 'sku_1',
      merchantId: 'mc_1',
      name: '有机鸡蛋 30 枚',
      skuCode: 'EGG-30',
      price: 39.9,
      stock: 120,
      status: 'on',
      updatedAt: Date.now() - 3600000,
    },
    {
      id: 'sku_2',
      merchantId: 'mc_1',
      name: '全麦吐司',
      skuCode: 'BREAD-01',
      price: 12.5,
      stock: 40,
      status: 'off',
      updatedAt: Date.now() - 7200000,
    },
  ]
}

function load(key, seedFn) {
  const raw = localStorage.getItem(key)
  if (raw) return JSON.parse(raw)
  const data = seedFn()
  localStorage.setItem(key, JSON.stringify(data))
  return data
}

function save(key, list) {
  localStorage.setItem(key, JSON.stringify(list))
}

export const useMerchantsStore = defineStore('merchants', () => {
  const merchants = ref(load(MERCHANT_KEY, seedMerchants))
  const skus = ref(load(SKU_KEY, seedSkus))

  const activeMerchantCount = computed(
    () => merchants.value.filter((m) => m.status === 'active').length,
  )

  function skuCountOf(merchantId) {
    return skus.value.filter((s) => s.merchantId === merchantId).length
  }

  function getMerchant(id) {
    return merchants.value.find((m) => m.id === id) || null
  }

  function skusOf(merchantId) {
    return skus.value.filter((s) => s.merchantId === merchantId)
  }

  function upsertMerchant(payload) {
    const name = payload.name?.trim()
    if (!name) throw new Error('请填写商家名称')
    const status = payload.status === 'inactive' ? 'inactive' : 'active'
    if (payload.id) {
      merchants.value = merchants.value.map((m) =>
        m.id === payload.id
          ? {
              ...m,
              name,
              contact: payload.contact?.trim() || '',
              phone: payload.phone?.trim() || '',
              status,
              remark: payload.remark?.trim() || '',
              updatedAt: Date.now(),
            }
          : m,
      )
      if (status === 'inactive') {
        // 停用商家时，其已上架 SKU 自动下架
        skus.value = skus.value.map((s) =>
          s.merchantId === payload.id && s.status === 'on'
            ? { ...s, status: 'off', updatedAt: Date.now() }
            : s,
        )
        save(SKU_KEY, skus.value)
      }
    } else {
      merchants.value = [
        {
          id: `mc_${Date.now()}`,
          name,
          contact: payload.contact?.trim() || '',
          phone: payload.phone?.trim() || '',
          status,
          remark: payload.remark?.trim() || '',
          updatedAt: Date.now(),
        },
        ...merchants.value,
      ]
    }
    save(MERCHANT_KEY, merchants.value)
  }

  function removeMerchant(id) {
    merchants.value = merchants.value.filter((m) => m.id !== id)
    skus.value = skus.value.filter((s) => s.merchantId !== id)
    save(MERCHANT_KEY, merchants.value)
    save(SKU_KEY, skus.value)
  }

  function setMerchantStatus(id, status) {
    upsertMerchant({ ...getMerchant(id), status })
  }

  function upsertSku(payload) {
    const merchant = getMerchant(payload.merchantId)
    if (!merchant) throw new Error('商家不存在')
    const name = payload.name?.trim()
    const skuCode = payload.skuCode?.trim()
    const price = Number(payload.price)
    const stock = Number(payload.stock)
    if (!name) throw new Error('请填写 SKU 名称')
    if (!skuCode) throw new Error('请填写 SKU 编码')
    if (Number.isNaN(price) || price < 0) throw new Error('价格不合法')
    if (!Number.isInteger(stock) || stock < 0) throw new Error('库存须为 ≥ 0 的整数')

    const wantOn = payload.status === 'on'
    if (wantOn && merchant.status !== 'active') {
      throw new Error('商家已停用，不能上架 SKU')
    }

    const duplicated = skus.value.some(
      (s) =>
        s.merchantId === payload.merchantId &&
        s.skuCode === skuCode &&
        s.id !== payload.id,
    )
    if (duplicated) throw new Error('同一商家下 SKU 编码不能重复')

    if (payload.id) {
      skus.value = skus.value.map((s) =>
        s.id === payload.id
          ? {
              ...s,
              name,
              skuCode,
              price,
              stock,
              status: wantOn ? 'on' : 'off',
              updatedAt: Date.now(),
            }
          : s,
      )
    } else {
      skus.value = [
        {
          id: `sku_${Date.now()}`,
          merchantId: payload.merchantId,
          name,
          skuCode,
          price,
          stock,
          status: wantOn ? 'on' : 'off',
          updatedAt: Date.now(),
        },
        ...skus.value,
      ]
    }
    save(SKU_KEY, skus.value)
  }

  function removeSku(id) {
    skus.value = skus.value.filter((s) => s.id !== id)
    save(SKU_KEY, skus.value)
  }

  function setSkuShelf(id, on) {
    const sku = skus.value.find((s) => s.id === id)
    if (!sku) return
    upsertSku({ ...sku, status: on ? 'on' : 'off' })
  }

  return {
    merchants,
    skus,
    activeMerchantCount,
    skuCountOf,
    getMerchant,
    skusOf,
    upsertMerchant,
    removeMerchant,
    setMerchantStatus,
    upsertSku,
    removeSku,
    setSkuShelf,
  }
})

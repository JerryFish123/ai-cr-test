import { defineStore } from 'pinia'
import { ref } from 'vue'

const KEY = 'prdemotest_members'

function seed() {
  return [
    {
      id: 'm_1',
      name: '张三',
      phone: '13800001111',
      balance: 128.5,
      level: '普通',
      createdAt: Date.now() - 86400000 * 8,
    },
    {
      id: 'm_2',
      name: '李四',
      phone: '13900002222',
      balance: 860,
      level: '金牌',
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'm_3',
      name: '王五',
      phone: '13700003333',
      balance: 36,
      level: '普通',
      createdAt: Date.now() - 86400000,
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

export const useMembersStore = defineStore('members', () => {
  const members = ref(load())

  function removeMember(id) {
    members.value = members.value.filter((m) => m.id !== id)
    save(members.value)
  }

  function updateBalance(id, balance) {
    const value = Number(balance)
    if (Number.isNaN(value) || value < 0) {
      throw new Error('余额必须是大于等于 0 的数字')
    }
    members.value = members.value.map((m) =>
      m.id === id ? { ...m, balance: Math.round(value * 100) / 100 } : m,
    )
    save(members.value)
  }

  function addMember({ name, phone, balance = 0, level = '普通' }) {
    if (!name?.trim() || !phone?.trim()) throw new Error('请填写姓名和手机号')
    const member = {
      id: `m_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      balance: Number(balance) || 0,
      level,
      createdAt: Date.now(),
    }
    members.value = [member, ...members.value]
    save(members.value)
    return member
  }

  return { members, removeMember, updateBalance, addMember }
})

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const USERS_KEY = 'prdemotest_users'
const SESSION_KEY = 'prdemotest_session'

function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY)
  if (raw) return JSON.parse(raw)
  const seed = [
    {
      id: 'u_admin',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      createdAt: Date.now(),
    },
  ]
  localStorage.setItem(USERS_KEY, JSON.stringify(seed))
  return seed
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const useAuthStore = defineStore('auth', () => {
  const users = ref(loadUsers())
  const session = ref(JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'))

  const currentUser = computed(() => session.value)
  const isLoggedIn = computed(() => Boolean(session.value))

  function persistSession(user) {
    const safe = user ? { id: user.id, username: user.username, role: user.role } : null
    session.value = safe
    if (safe) localStorage.setItem(SESSION_KEY, JSON.stringify(safe))
    else localStorage.removeItem(SESSION_KEY)
  }

  function register({ username, password }) {
    const name = username.trim()
    if (!name || !password) throw new Error('请填写用户名和密码')
    if (name.length < 3) throw new Error('用户名至少 3 个字符')
    if (password.length < 6) throw new Error('密码至少 6 个字符')
    if (users.value.some((u) => u.username === name)) {
      throw new Error('用户名已存在')
    }
    const user = {
      id: `u_${Date.now()}`,
      username: name,
      password,
      role: 'admin',
      createdAt: Date.now(),
    }
    users.value = [...users.value, user]
    saveUsers(users.value)
    persistSession(user)
    return user
  }

  function login({ username, password }) {
    const user = users.value.find(
      (u) => u.username === username.trim() && u.password === password,
    )
    if (!user) throw new Error('用户名或密码错误')
    persistSession(user)
    return user
  }

  function logout() {
    persistSession(null)
  }

  return { users, currentUser, isLoggedIn, register, login, logout }
})

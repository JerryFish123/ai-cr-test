<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('admin')
const password = ref('admin123')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    auth.login({ username: username.value, password: password.value })
    router.replace((route.query.redirect && String(route.query.redirect)) || '/dashboard')
  } catch (e) {
    error.value = e.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <form class="panel auth-card" @submit.prevent="onSubmit">
      <h1>后台登录</h1>
      <p class="hint">演示账号：admin / admin123（数据保存在浏览器本地）</p>
      <div v-if="error" class="error">{{ error }}</div>
      <div class="field">
        <label for="username">用户名</label>
        <input id="username" v-model="username" autocomplete="username" />
      </div>
      <div class="field">
        <label for="password">密码</label>
        <input id="password" v-model="password" type="password" autocomplete="current-password" />
      </div>
      <button class="btn" type="submit" :disabled="loading">
        {{ loading ? '登录中…' : '登录' }}
      </button>
      <p class="switch">
        还没有账号？
        <RouterLink to="/register">注册</RouterLink>
      </p>
    </form>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background:
    radial-gradient(800px 360px at 80% 0%, rgba(43, 184, 160, 0.18), transparent 60%),
    linear-gradient(160deg, #0f1419, #162029 55%, #101820);
}

.auth-card {
  width: min(420px, 100%);
}

h1 {
  margin: 0 0 0.35rem;
  font-size: 1.6rem;
}

.hint {
  margin: 0 0 1.1rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.btn {
  width: 100%;
}

.switch {
  margin: 1rem 0 0;
  color: var(--muted);
  text-align: center;
}
</style>

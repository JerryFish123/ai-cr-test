<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const confirm = ref('')
const error = ref('')

function onSubmit() {
  error.value = ''
  if (password.value !== confirm.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  try {
    auth.register({ username: username.value, password: password.value })
    router.replace('/dashboard')
  } catch (e) {
    error.value = e.message || '注册失败'
  }
}
</script>

<template>
  <div class="auth-page">
    <form class="panel auth-card" @submit.prevent="onSubmit">
      <h1>注册管理员</h1>
      <p class="hint">本地演示用注册，暂无真实后端校验</p>
      <div v-if="error" class="error">{{ error }}</div>
      <div class="field">
        <label for="username">用户名</label>
        <input id="username" v-model="username" autocomplete="username" />
      </div>
      <div class="field">
        <label for="password">密码</label>
        <input id="password" v-model="password" type="password" autocomplete="new-password" />
      </div>
      <div class="field">
        <label for="confirm">确认密码</label>
        <input id="confirm" v-model="confirm" type="password" autocomplete="new-password" />
      </div>
      <button class="btn" type="submit">注册并进入</button>
      <p class="switch">
        已有账号？
        <RouterLink to="/login">去登录</RouterLink>
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
    radial-gradient(800px 360px at 20% 10%, rgba(43, 184, 160, 0.16), transparent 60%),
    linear-gradient(160deg, #0f1419, #162029 55%, #101820);
}

.auth-card {
  width: min(420px, 100%);
}

h1 {
  margin: 0 0 0.35rem;
}

.hint {
  margin: 0 0 1.1rem;
  color: var(--muted);
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

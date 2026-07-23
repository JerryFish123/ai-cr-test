<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const nav = [
  { to: '/dashboard', label: '概览' },
  { to: '/members', label: '会员管理' },
  { to: '/products', label: '产品管理' },
  { to: '/banners', label: 'Banner 管理' },
  { to: '/merchants', label: '商家管理' },
]

const active = computed(() => route.path)

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="shell">
    <aside class="side">
      <div class="brand">
        <span class="mark">PR</span>
        <div>
          <strong>Prdemo Admin</strong>
          <small>后台管理</small>
        </div>
      </div>
      <nav>
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: active.startsWith(item.to) }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="side-foot">
        <div class="user">{{ auth.currentUser?.username }}</div>
        <button class="btn ghost sm" type="button" @click="logout">退出登录</button>
      </div>
    </aside>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px 1fr;
}

.side {
  background: linear-gradient(180deg, #18212c 0%, #121820 100%);
  border-right: 1px solid var(--line);
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.brand {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.25rem 0.35rem;
}

.mark {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: #06241f;
  font-weight: 800;
}

.brand strong {
  display: block;
}

.brand small {
  color: var(--muted);
}

nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.nav-item {
  color: var(--muted);
  padding: 0.7rem 0.85rem;
  border-radius: 8px;
}

.nav-item:hover,
.nav-item.active {
  color: var(--text);
  background: rgba(43, 184, 160, 0.12);
}

.side-foot {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.user {
  color: var(--muted);
  font-size: 0.9rem;
}

.main {
  padding: 1.5rem;
  background:
    radial-gradient(1000px 400px at 10% -10%, rgba(43, 184, 160, 0.12), transparent 55%),
    var(--bg);
}

@media (max-width: 860px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .side {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  nav {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>

<script setup>
import { reactive, ref } from 'vue'
import { useMembersStore } from '../stores/members'

const store = useMembersStore()
const error = ref('')
const showAdd = ref(false)
const balanceTarget = ref(null)
const addForm = reactive({ name: '', phone: '', balance: 0, level: '普通' })
const balanceForm = reactive({ balance: 0 })

function openAdd() {
  error.value = ''
  Object.assign(addForm, { name: '', phone: '', balance: 0, level: '普通' })
  showAdd.value = true
}

function submitAdd() {
  error.value = ''
  try {
    store.addMember({ ...addForm })
    showAdd.value = false
  } catch (e) {
    error.value = e.message
  }
}

function openBalance(member) {
  error.value = ''
  balanceTarget.value = member
  balanceForm.balance = member.balance
}

function submitBalance() {
  error.value = ''
  try {
    store.updateBalance(balanceTarget.value.id, balanceForm.balance)
    balanceTarget.value = null
  } catch (e) {
    error.value = e.message
  }
}

function removeMember(member) {
  if (!confirm(`确认删除会员「${member.name}」？`)) return
  store.removeMember(member.id)
}

function formatTime(ts) {
  return new Date(ts).toLocaleString()
}
</script>

<template>
  <section>
    <div class="toolbar">
      <div>
        <h1>会员管理</h1>
        <p class="sub">支持删除会员、修改余额（本地 mock）</p>
      </div>
      <button class="btn" type="button" @click="openAdd">新增会员</button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="table-wrap panel" style="padding: 0">
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>手机号</th>
            <th>等级</th>
            <th>余额</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in store.members" :key="m.id">
            <td>{{ m.name }}</td>
            <td>{{ m.phone }}</td>
            <td>{{ m.level }}</td>
            <td>¥{{ Number(m.balance).toFixed(2) }}</td>
            <td>{{ formatTime(m.createdAt) }}</td>
            <td>
              <div class="actions">
                <button class="btn sm ghost" type="button" @click="openBalance(m)">改余额</button>
                <button class="btn sm danger" type="button" @click="removeMember(m)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!store.members.length" class="empty">暂无会员</div>
    </div>

    <div v-if="showAdd" class="modal-mask" @click.self="showAdd = false">
      <div class="modal">
        <h3>新增会员</h3>
        <div class="field">
          <label>姓名</label>
          <input v-model="addForm.name" />
        </div>
        <div class="field">
          <label>手机号</label>
          <input v-model="addForm.phone" />
        </div>
        <div class="field">
          <label>余额</label>
          <input v-model.number="addForm.balance" type="number" min="0" step="0.01" />
        </div>
        <div class="field">
          <label>等级</label>
          <select v-model="addForm.level">
            <option>普通</option>
            <option>银牌</option>
            <option>金牌</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" @click="showAdd = false">取消</button>
          <button class="btn" type="button" @click="submitAdd">保存</button>
        </div>
      </div>
    </div>

    <div v-if="balanceTarget" class="modal-mask" @click.self="balanceTarget = null">
      <div class="modal">
        <h3>修改余额 · {{ balanceTarget.name }}</h3>
        <div class="field">
          <label>新余额</label>
          <input v-model.number="balanceForm.balance" type="number" min="0" step="0.01" />
        </div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" @click="balanceTarget = null">取消</button>
          <button class="btn" type="button" @click="submitBalance">确认修改</button>
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
</style>

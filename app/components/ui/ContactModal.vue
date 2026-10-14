<script setup lang="ts">
import { budgets, site } from '~/data/site'

const { open, hide } = useContactModal()
const nuxtApp = useNuxtApp()
const sent = ref(false)
const sending = ref(false)
const form = reactive({ name: '', contact: '', budget: budgets[1] ?? '', message: '', agree: false })
const dialog = ref<HTMLElement | null>(null)

const submit = async () => {
  if (!form.agree) return
  sending.value = true
  // TODO(backend): POST to /api/contact (see docs/sdlc for the planned endpoint)
  await new Promise((r) => setTimeout(r, 900))
  sending.value = false
  sent.value = true
}

const onKey = (e: KeyboardEvent) => e.key === 'Escape' && hide()

watch(open, (v) => {
  if (v) {
    nuxtApp.$lenis?.stop()
    window.addEventListener('keydown', onKey)
    nextTick(() => dialog.value?.querySelector<HTMLElement>('input')?.focus())
  } else {
    nuxtApp.$lenis?.start()
    window.removeEventListener('keydown', onKey)
    setTimeout(() => (sent.value = false), 600)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" @click.self="hide">
        <div ref="dialog" class="modal__panel" data-lenis-prevent>
          <button class="modal__close" type="button" aria-label="Yopish" @click="hide">×</button>

          <template v-if="!sent">
            <h2 id="modal-title" class="h2">Salom! Keling, yangi eng yaxshi loyihangizni muhokama qilamiz</h2>
            <form class="modal__form" @submit.prevent="submit">
              <label class="field">
                <span class="mono dim">Ismingiz</span>
                <input v-model="form.name" required autocomplete="name" type="text" />
              </label>
              <label class="field">
                <span class="mono dim">Telefon, e-mail yoki @telegram</span>
                <input v-model="form.contact" required type="text" />
              </label>
              <fieldset class="field">
                <legend class="mono dim">Byudjet</legend>
                <div class="chips">
                  <label v-for="b in budgets" :key="b" class="chip" :class="{ 'is-active': form.budget === b }">
                    <input v-model="form.budget" type="radio" name="budget" :value="b" class="visually-hidden" />
                    {{ b }}
                  </label>
                </div>
              </fieldset>
              <label class="field">
                <span class="mono dim">Xabar</span>
                <textarea v-model="form.message" rows="3" />
              </label>
              <label class="agree">
                <input v-model="form.agree" type="checkbox" required />
                <span class="dim">Shaxsiy ma’lumotlarni qayta ishlashga roziman</span>
              </label>
              <button class="btn btn--solid" type="submit" :disabled="sending">
                {{ sending ? 'Yuborilmoqda…' : 'Yuborish' }}
              </button>
            </form>
          </template>

          <div v-else class="modal__done">
            <h2 id="modal-title" class="h2">Rahmat!</h2>
            <p class="lead dim">So‘rovingizni o‘rganib, tez orada bog‘lanamiz.</p>
            <a class="btn" :href="site.telegram" target="_blank" rel="noopener">Telegramda yozish</a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
}
.modal__panel {
  position: relative;
  width: min(720px, 100%);
  height: 100%;
  overflow-y: auto;
  padding: clamp(28px, 5vw, 64px);
  background: var(--bg-2);
  border-left: 1px solid var(--line);
}
.modal__panel .h2 {
  font-size: clamp(1.6rem, 3vw, 2.6rem);
  max-width: 14ch;
  margin-bottom: 40px;
}
.modal__close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--line);
  font-size: 1.6rem;
  line-height: 1;
}
.modal__form {
  display: grid;
  gap: 26px;
}
.field {
  display: grid;
  gap: 8px;
  border: 0;
  padding: 0;
  margin: 0;
}
.field input,
.field textarea {
  width: 100%;
  padding: 10px 0;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: transparent;
  color: var(--fg);
  font: inherit;
  font-size: 1.15rem;
  outline: none;
  transition: border-color 0.3s;
}
.field input:focus,
.field textarea:focus {
  border-color: var(--accent);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.chip {
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid var(--line);
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}
.chip.is-active {
  background: var(--accent);
  border-color: var(--accent);
  color: #000;
}
.chip:focus-within {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.agree {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 0.9rem;
}
.agree input {
  accent-color: var(--accent);
  width: 18px;
  height: 18px;
}
.modal__form .btn {
  justify-self: start;
}
.modal__done {
  display: grid;
  gap: 24px;
  align-content: center;
  min-height: 70%;
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.6s var(--ease-out);
}
.modal-enter-active .modal__panel,
.modal-leave-active .modal__panel {
  transition: transform 0.7s var(--ease-out);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal__panel,
.modal-leave-to .modal__panel {
  transform: translateX(100%);
}
</style>

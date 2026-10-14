<script setup lang="ts">
import { telegram } from '~/data/site'

const { open, hide } = useContactModal()
const nuxtApp = useNuxtApp()
const t = useSite()
const { status, send, reset } = useLead()
const form = reactive({ name: '', contact: '', budget: '', message: '', hp: '', agree: false })
const dialog = ref<HTMLElement | null>(null)
let returnTo: HTMLElement | null = null

const tried = ref(false)
const bad = computed(() => ({
  name: !form.name.trim(),
  contact: !form.contact.trim(),
  agree: !form.agree
}))
const submit = () => {
  tried.value = true
  if (bad.value.name || bad.value.contact || bad.value.agree) {
    nextTick(() => dialog.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
    return
  }
  send(form)
}
const pickBudget = (b: string) => (form.budget = form.budget === b ? '' : b)

const setInert = (v: boolean) => document.getElementById('__nuxt')?.toggleAttribute('inert', v)
const onKey = (e: KeyboardEvent) => e.key === 'Escape' && hide()

watch(open, (v) => {
  if (v) {
    returnTo = document.activeElement as HTMLElement | null
    form.budget = ''
    form.agree = false
    tried.value = false
    nuxtApp.$lenis?.stop()
    setInert(true)
    window.addEventListener('keydown', onKey)
    nextTick(() => dialog.value?.querySelector<HTMLElement>('input')?.focus())
  } else {
    nuxtApp.$lenis?.start()
    setInert(false)
    window.removeEventListener('keydown', onKey)
    nextTick(() => returnTo?.focus())
    setTimeout(reset, 600)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  setInert(false)
})

watch(status, (v) => v === 'sent' && nextTick(() => document.getElementById('modal-title')?.focus()))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" @click.self="hide">
        <div ref="dialog" class="modal__panel" data-lenis-prevent>
          <button class="modal__close" type="button" :aria-label="t.ui.modal.close" @click="hide">×</button>

          <template v-if="status !== 'sent'">
            <h2 id="modal-title" class="h2">{{ t.ui.modal.title }}</h2>
            <p class="modal__note dim">{{ t.ui.modal.note }}</p>
            <form class="modal__form" novalidate :aria-busy="status === 'sending'" @submit.prevent="submit">
              <label class="field">
                <span class="mono dim">{{ t.ui.modal.name }}</span>
                <input v-model="form.name" required maxlength="100" autocomplete="name" type="text" :aria-invalid="tried && bad.name" :aria-describedby="tried && bad.name ? 'err-name' : undefined" />
                <span v-if="tried && bad.name" id="err-name" class="field__err">{{ t.ui.modal.errName }}</span>
              </label>
              <label class="field">
                <span class="mono dim">{{ t.ui.modal.contact }}</span>
                <input v-model="form.contact" required maxlength="100" autocomplete="off" autocapitalize="off" spellcheck="false" type="text" :aria-invalid="tried && bad.contact" :aria-describedby="tried && bad.contact ? 'err-contact' : undefined" />
                <span v-if="tried && bad.contact" id="err-contact" class="field__err">{{ t.ui.modal.errContact }}</span>
              </label>
              <div class="field" role="group" aria-labelledby="modal-budget">
                <span id="modal-budget" class="mono dim">{{ t.ui.modal.budget }}</span>
                <div class="chips">
                  <button
                    v-for="b in t.budgets"
                    :key="b"
                    type="button"
                    class="chip"
                    :class="{ 'is-active': form.budget === b }"
                    :aria-pressed="form.budget === b"
                    @click="pickBudget(b)"
                  >
                    <span v-if="form.budget === b" aria-hidden="true">✓ </span>{{ b }}
                  </button>
                </div>
              </div>
              <label class="field">
                <span class="mono dim">{{ t.ui.modal.message }}</span>
                <textarea v-model="form.message" rows="3" maxlength="1000" />
              </label>
              <div class="hp" aria-hidden="true">
                <input v-model="form.hp" type="text" name="website" tabindex="-1" autocomplete="off" />
              </div>
              <label class="agree">
                <input v-model="form.agree" type="checkbox" required :aria-invalid="tried && bad.agree" :aria-describedby="tried && bad.agree ? 'err-agree' : undefined" />
                <span class="dim">{{ t.ui.modal.consent }}</span>
                <span v-if="tried && bad.agree" id="err-agree" class="field__err">{{ t.ui.modal.errConsent }}</span>
              </label>
              <p v-if="status === 'error' || status === 'throttled'" class="modal__alert" :class="{ 'is-error': status === 'error' }" :role="status === 'error' ? 'alert' : 'status'">
                {{ status === 'error' ? t.ui.modal.error : t.ui.modal.throttled }}
                <a v-if="status === 'error'" :href="telegram" target="_blank" rel="noopener">{{ t.ui.modal.telegram }} ↗</a>
              </p>
              <button class="btn btn--solid" type="submit" :aria-disabled="status === 'sending'" data-cta="submit" @click="status === 'sending' && $event.preventDefault()">
                {{ status === 'sending' ? t.ui.modal.sending : status === 'error' ? t.ui.modal.retry : t.ui.modal.send }}
              </button>
            </form>
          </template>

          <div v-else class="modal__done" aria-live="polite">
            <h2 id="modal-title" class="h2" tabindex="-1">{{ t.ui.modal.doneTitle }}</h2>
            <p class="lead dim">{{ t.ui.modal.doneText }}</p>
            <a class="btn" :href="telegram" target="_blank" rel="noopener">{{ t.ui.modal.telegram }}</a>
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
  background: rgb(var(--bg-rgb) / 0.6);
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
  border: 1px solid var(--line-strong);
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
  border-bottom: 1px solid var(--line-strong);
  background: transparent;
  color: var(--fg);
  font: inherit;
  font-size: 1.15rem;
  outline: none;
  transition: border-color 0.3s;
}
.field__err {
  color: var(--danger, #ff6b6b);
  font-size: 0.8125rem;
}
.field input[aria-invalid='true'] {
  border-color: var(--danger, #ff6b6b);
}
.field input:focus,
.field textarea:focus {
  border-color: var(--accent-ink);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.chip {
  min-height: 44px;
  color: inherit;
  font: inherit;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}
.chip.is-active {
  background: var(--accent);
  border-color: var(--accent-ink);
  color: var(--on-accent);
}
.chip:focus-visible {
  outline: 2px solid var(--accent-ink);
  outline-offset: 2px;
}
.agree {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 0.9rem;
}
.agree input {
  accent-color: var(--accent-ink);
  width: 18px;
  height: 18px;
}
.modal__note {
  margin: -24px 0 32px;
}
.hp {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.modal__alert {
  padding: 16px;
  border: 1px solid var(--line-strong);
  border-radius: 14px;
}
.modal__alert.is-error {
  border-color: var(--danger);
  color: var(--danger);
}
.modal__alert a {
  display: block;
  margin-top: 8px;
  color: var(--fg);
  text-decoration: underline;
}
.modal__form .btn {
  min-width: 220px;
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
.btn[aria-disabled='true'] {
  opacity: 0.6;
  cursor: progress;
}
</style>

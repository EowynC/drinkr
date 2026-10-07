<template>
    <MainLayout>
        <main class="admin-page">
            <section class="admin-panel">
                <p class="admin-eyebrow">Bartendr access</p>
                <h1>{{ isAdminConfigured ? (isAdminUnlocked ? 'Admin access' : 'Admin login') : 'Set up admin access' }}</h1>

                <template v-if="!isAdminConfigured">
                    <p class="admin-copy">Create a 6-12 digit PIN to open sales, recipes, inventory, and settings.</p>
                    <p v-if="!canUseSecureHashing" class="admin-notice">PIN setup requires HTTPS. This browser only allows secure PIN hashing over HTTPS or localhost.</p>
                    <form class="admin-form" @submit.prevent="setupAdmin">
                        <label for="new-pin">Admin PIN</label>
                        <input id="new-pin" v-model="pin" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="new-password" minlength="6" maxlength="12" required>
                        <label for="confirm-pin">Confirm PIN</label>
                        <input id="confirm-pin" v-model="confirmation" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="new-password" minlength="6" maxlength="12" required>
                        <p class="admin-error" role="alert">{{ errorMessage }}</p>
                        <button class="admin-primary" type="submit" :disabled="isSubmitting">Create admin PIN</button>
                    </form>
                </template>

                <template v-else-if="!isAdminUnlocked">
                    <p class="admin-copy">Enter the admin PIN to access department tools.</p>
                    <form class="admin-form" @submit.prevent="login">
                        <label for="admin-pin">Admin PIN</label>
                        <input id="admin-pin" v-model="pin" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="current-password" minlength="6" maxlength="12" required>
                        <p class="admin-error" role="alert">{{ errorMessage }}</p>
                        <button class="admin-primary" type="submit" :disabled="isSubmitting">Unlock admin</button>
                    </form>
                </template>

                <template v-else>
                    <p class="admin-copy">Admin tools are unlocked. Access locks automatically after 10 minutes without activity.</p>
                    <form class="admin-form" @submit.prevent="updatePassword">
                        <h2>Change PIN</h2>
                        <label for="current-pin">Current PIN</label>
                        <input id="current-pin" v-model="currentPin" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="current-password" minlength="6" maxlength="12" required>
                        <label for="replacement-pin">New PIN</label>
                        <input id="replacement-pin" v-model="replacementPin" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="new-password" minlength="6" maxlength="12" required>
                        <label for="confirm-replacement">Confirm new PIN</label>
                        <input id="confirm-replacement" v-model="replacementConfirmation" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="new-password" minlength="6" maxlength="12" required>
                        <p class="admin-error" role="alert">{{ errorMessage }}</p>
                        <button class="admin-primary" type="submit" :disabled="isSubmitting">Update password</button>
                    </form>
                    <button class="admin-secondary" type="button" @click="lockAndReturn">Lock and return to bar</button>
                </template>
            </section>
        </main>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import {
    changeAdminPin,
    createAdminPin,
    isAdminConfigured,
    isAdminUnlocked,
    lockAdmin,
    loginAdmin
} from '../auth'

const route = useRoute()
const router = useRouter()
const pin = ref('')
const confirmation = ref('')
const currentPin = ref('')
const replacementPin = ref('')
const replacementConfirmation = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const canUseSecureHashing = globalThis.isSecureContext && !!crypto.subtle

async function setupAdmin() {
    errorMessage.value = ''
    if (pin.value !== confirmation.value) {
        errorMessage.value = 'PINs do not match.'
        return
    }

    await submit(async () => {
        await createAdminPin(pin.value)
        pin.value = ''
        confirmation.value = ''
        await continueToRequestedPage()
    })
}

async function login() {
    errorMessage.value = ''
    await submit(async () => {
        const success = await loginAdmin(pin.value)
        if (!success) {
            errorMessage.value = 'Incorrect PIN.'
            return
        }
        pin.value = ''
        await continueToRequestedPage()
    })
}

async function updatePassword() {
    errorMessage.value = ''
    if (replacementPin.value !== replacementConfirmation.value) {
        errorMessage.value = 'New PINs do not match.'
        return
    }

    await submit(async () => {
        const success = await changeAdminPin(currentPin.value, replacementPin.value)
        if (!success) {
            errorMessage.value = 'Current PIN is incorrect.'
            return
        }
        currentPin.value = ''
        replacementPin.value = ''
        replacementConfirmation.value = ''
    })
}

async function submit(action: () => Promise<void>) {
    isSubmitting.value = true
    try {
        await action()
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Unable to complete the request.'
    } finally {
        isSubmitting.value = false
    }
}

async function continueToRequestedPage() {
    const requested = typeof route.query.redirect === 'string' ? route.query.redirect : '/bar'
    const destination = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/bar'
    await router.replace(destination)
}

function lockAndReturn() {
    lockAdmin()
    void router.replace('/bar')
}
</script>

<style scoped>
.admin-page {
    display: grid;
    place-items: start center;
    padding: clamp(1.5rem, 6vh, 4rem) 1rem;
}

.admin-panel {
    width: min(100%, 440px);
    padding: 1.5rem;
    border: 1px solid var(--border);
    border-top: 4px solid var(--accent);
    background: var(--bg);
    box-shadow: var(--shadow);
    text-align: left;
}

.admin-eyebrow {
    margin: 0;
    color: var(--accent);
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
}

.admin-panel h1 {
    margin: 0.4rem 0 0.6rem;
    font-size: 2rem;
    line-height: 1.15;
}

.admin-copy {
    margin-bottom: 1.25rem;
}

.admin-form {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
}

.admin-form h2 {
    margin: 0.5rem 0;
}

.admin-form label {
    color: var(--text-h);
    font-weight: 600;
}

.admin-form input {
    box-sizing: border-box;
    width: 100%;
    min-height: 2.8rem;
    margin-bottom: 0.45rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg);
    color: var(--text-h);
    font: inherit;
}

.admin-primary,
.admin-secondary {
    min-height: 2.8rem;
    padding: 0.65rem 0.9rem;
    border-radius: 4px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
}

.admin-primary {
    border: 0;
    background: var(--accent);
    color: var(--text-button, white);
}

.admin-primary:disabled {
    opacity: 0.65;
    cursor: wait;
}

.admin-secondary {
    width: 100%;
    margin-top: 0.75rem;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-h);
}

.admin-error {
    min-height: 1.4em;
    color: var(--negative-feedback);
}

.admin-notice {
    margin: 0 0 1rem;
    padding: 0.7rem;
    border-left: 3px solid var(--negative-feedback);
    background: var(--code-bg);
    color: var(--text-h);
    font-size: 0.9rem;
}
</style>
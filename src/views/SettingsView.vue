<template>
    <MainLayout>
        <div class="settings-page">
            <div class="settings-card">
                <h1>Settings</h1>

                <div class="setting-row">
                    <span>Show snip pricing in the bar</span>
                    <input
                        :checked="draft.features.showSnipPricing"
                        type="checkbox"
                        @change="toggleSnipPricing"
                    >
                </div>

                <div class="setting-row">
                    <span>Show undo last sale in the bar</span>
                    <input
                        :checked="draft.features.showUndoLastSale"
                        type="checkbox"
                        @change="toggleUndoLastSale"
                    >
                </div>

                <div v-if="draft.features.showSnipPricing" class="setting-row setting-row--value">
                    <div class="setting-label-group">
                        <span>Base price for 1 snip</span>
                        <p v-if="!isEditingSnipPrice">{{ formatCurrency(draft.pricing.snipBasePrice) }}</p>
                        <input
                            v-else
                            v-model.number="draft.pricing.snipBasePrice"
                            type="number"
                            min="0.01"
                            step="0.01"
                        >
                    </div>
                    <div class="setting-actions">
                        <button v-if="!isEditingSnipPrice" type="button" class="secondary-button" @click="startEditingSnipPrice">
                            Edit
                        </button>
                        <button v-else type="button" class="primary-button" @click="cancelEditingSnipPrice">
                            Save
                        </button>
                    </div>
                </div>

                <div class="settings-actions">
                    <button type="button" class="reset-button" @click="resetToDefaults">
                        Reset to defaults
                    </button>
                    <button type="button" class="primary-button" @click="saveChanges">
                        Save
                    </button>
                </div>

                <button type="button" class="export-button" @click="exportIndexedDB">
                    Export database
                </button>

                <section class="security-settings">
                    <h2>Change admin PIN</h2>
                    <form class="pin-form" @submit.prevent="updateAdminPin">
                        <label for="current-admin-pin">Current PIN</label>
                        <input id="current-admin-pin" v-model="currentAdminPin" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="current-password" minlength="6" maxlength="12" required>
                        <label for="new-admin-pin">New PIN</label>
                        <input id="new-admin-pin" v-model="newAdminPin" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="new-password" minlength="6" maxlength="12" required>
                        <label for="confirm-admin-pin">Confirm new PIN</label>
                        <input id="confirm-admin-pin" v-model="confirmAdminPin" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="new-password" minlength="6" maxlength="12" required>
                        <p v-if="pinError" class="pin-error" role="alert">{{ pinError }}</p>
                        <button class="primary-button" type="submit" :disabled="isChangingPin">
                            {{ isChangingPin ? 'Updating...' : 'Update admin PIN' }}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from 'vue-toast-notification'
import { exportDB } from 'dexie-export-import'
import MainLayout from '../components/layout/MainLayout.vue'
import { changeAdminPin } from '../auth'
import { db } from '../database/database'
import { DEFAULT_SETTINGS, type AppSettings, useAppSettings } from '../settings'

const toast = useToast({ position: 'top-right' })
const { settings, saveSettings } = useAppSettings()
const draft = ref<AppSettings>(cloneSettings(settings.value))
const isEditingSnipPrice = ref(false)
const currentAdminPin = ref('')
const newAdminPin = ref('')
const confirmAdminPin = ref('')
const pinError = ref('')
const isChangingPin = ref(false)

watch(settings, () => {
    draft.value = cloneSettings(settings.value)
    isEditingSnipPrice.value = false
}, { deep: true })

function cloneSettings(value: AppSettings): AppSettings {
    return JSON.parse(JSON.stringify(value)) as AppSettings
}

function toggleSnipPricing(event: Event) {
    const target = event.target as HTMLInputElement | null
    draft.value.features.showSnipPricing = !!target?.checked
}

function toggleUndoLastSale(event: Event) {
    const target = event.target as HTMLInputElement | null
    draft.value.features.showUndoLastSale = !!target?.checked
}

function startEditingSnipPrice() {
    isEditingSnipPrice.value = true
}

function cancelEditingSnipPrice() {
    isEditingSnipPrice.value = false
}

function saveChanges() {
    const nextValue = Number(draft.value.pricing.snipBasePrice)

    draft.value.pricing.snipBasePrice = Number.isFinite(nextValue) && nextValue > 0
        ? nextValue
        : DEFAULT_SETTINGS.pricing.snipBasePrice

    saveSettings(draft.value)
    isEditingSnipPrice.value = false
    toast.success('Settings saved.')
}

function resetToDefaults() {
    draft.value = cloneSettings(DEFAULT_SETTINGS)
    isEditingSnipPrice.value = false
    toast.success('Settings reset to defaults.')
}

async function updateAdminPin() {
    pinError.value = ''
    if (newAdminPin.value !== confirmAdminPin.value) {
        pinError.value = 'New PINs do not match.'
        return
    }

    isChangingPin.value = true
    try {
        const changed = await changeAdminPin(currentAdminPin.value, newAdminPin.value)
        if (!changed) {
            pinError.value = 'Current PIN is incorrect.'
            return
        }

        currentAdminPin.value = ''
        newAdminPin.value = ''
        confirmAdminPin.value = ''
        toast.success('Admin PIN updated.')
    } catch (error) {
        pinError.value = error instanceof Error ? error.message : 'Unable to update admin PIN.'
    } finally {
        isChangingPin.value = false
    }
}

async function exportIndexedDB() {
    try {
        const confirmed = confirm('This is only meant for admins, continue?')
        if (!confirmed) return

        const blob = await exportDB(db, { prettyJson: true })
        const url = URL.createObjectURL(blob)
        const file = document.createElement('a')
        file.href = url
        file.download = 'bartendr-export.json'
        file.click()
        URL.revokeObjectURL(url)
        toast.success('Database export started.')
    } catch (error) {
        console.error('Failed to export database', error)
        toast.error('Failed to export database.')
    }
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: 'EUR'
    }).format(value)
}
</script>

<style>
    .settings-page {
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 2rem 1rem;
        box-sizing: border-box;
    }

    .settings-card {
        width: min(100%, 520px);
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 1.5rem;
        box-sizing: border-box;
        box-shadow: var(--shadow);
    }

    .settings-card h1 {
        margin: 0 0 1rem;
        color: var(--text-h);
    }

    .setting-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin: 0 0 1rem;
        color: var(--text-h);
        font-weight: 600;
    }

    .setting-row--value {
        align-items: center;
        padding: 0.9rem 0.75rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--code-bg);
    }

    .setting-label-group {
        display: flex;
        flex-flow: column;
        justify-content: center;
        gap: 0.25rem;
        flex: 1;
    }

    .setting-label-group p {
        margin: 0;
        color: var(--text-h);
        font-weight: 700;
    }

    .setting-label-group input {
        width: 100%;
        box-sizing: border-box;
        padding: 0.55rem 0.6rem;
        border: 1px solid var(--border);
        border-radius: 6px;
        background: var(--bg);
        color: var(--text-h);
    }

    .setting-row input[type='checkbox'] {
        width: 1rem;
        height: 1rem;
        accent-color: var(--accent);
    }

    .setting-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-left: auto;
        min-height: 2.75rem;
    }

    .settings-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    .security-settings {
        margin-top: 1.5rem;
        padding-top: 1.25rem;
        border-top: 1px solid var(--border);
    }

    .security-settings h2 {
        margin: 0 0 1rem;
        color: var(--text-h);
        font-size: 1.2rem;
    }

    .pin-form {
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
    }

    .pin-form label {
        color: var(--text-h);
        font-weight: 600;
    }

    .pin-form input {
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

    .pin-form .primary-button {
        flex: initial;
    }

    .pin-form .primary-button:disabled {
        opacity: 0.65;
        cursor: wait;
    }

    .pin-error {
        margin: 0;
        color: var(--negative-feedback);
    }

    .primary-button,
    .secondary-button,
    .reset-button,
    .export-button {
        border-radius: 6px;
        padding: 0.75rem 1rem;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
    }

    .primary-button {
        border: none;
        background: var(--accent);
        color: var(--text-button);
        flex: 1;
        min-width: 7rem;
    }

    .secondary-button {
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--text-h);
    }

    .reset-button {
        border: 1px solid var(--border);
        background: var(--code-bg);
        color: var(--text-h);
        flex: 1;
    }

    .export-button {
        width: 100%;
        margin-top: 1rem;
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--text-h);
    }
</style>

import { ref } from 'vue'

export type AppSettings = {
    features: {
        showSnipPricing: boolean
    }
    pricing: {
        snipBasePrice: number
    }
}

export const DEFAULT_SETTINGS: AppSettings = {
    features: {
        showSnipPricing: false
    },
    pricing: {
        snipBasePrice: 3
    }
}

const STORAGE_KEY = 'drinkr.settings'

function normaliseSettings(value: Partial<AppSettings> | null | undefined): AppSettings {
    const next = value ?? {}

    return {
        features: {
            ...DEFAULT_SETTINGS.features,
            ...(next.features ?? {})
        },
        pricing: {
            ...DEFAULT_SETTINGS.pricing,
            ...(next.pricing ?? {})
        }
    }
}

export function calculateSnipCount(value: number, snipBasePrice: number) {
    const safeBasePrice = Number.isFinite(snipBasePrice) && snipBasePrice > 0
        ? snipBasePrice
        : DEFAULT_SETTINGS.pricing.snipBasePrice

    return Math.max(1, Math.round(value / safeBasePrice))
}

export function useAppSettings() {
    const settings = ref<AppSettings>(readSettings())

    function readSettings(): AppSettings {
        if (typeof localStorage === 'undefined') {
            return DEFAULT_SETTINGS
        }

        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (!raw) {
                return DEFAULT_SETTINGS
            }

            return normaliseSettings(JSON.parse(raw) as Partial<AppSettings>)
        } catch {
            return DEFAULT_SETTINGS
        }
    }

    function saveSettings(next: AppSettings) {
        const normalised = normaliseSettings(next)
        settings.value = normalised

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalised))
        }
    }

    function updateSettings(partial: Partial<AppSettings>) {
        const next: AppSettings = {
            ...settings.value,
            ...partial,
            features: {
                ...settings.value.features,
                ...partial.features
            },
            pricing: {
                ...settings.value.pricing,
                ...partial.pricing
            }
        }

        saveSettings(next)
    }

    return {
        settings,
        updateSettings,
        saveSettings
    }
}

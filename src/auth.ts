import { ref } from 'vue'
import { db, type AdminCredential } from './database/database'

const PIN_ITERATIONS = 600_000
const IDLE_TIMEOUT_MS = 5 * 60 * 1000
const MIN_PIN_LENGTH = 6
const MAX_PIN_LENGTH = 12

export const isAdminConfigured = ref(false)
export const isAdminUnlocked = ref(false)

let idleTimer: ReturnType<typeof setTimeout> | undefined
let activityListenersAttached = false

export async function initializeAdminAuth() {
    isAdminConfigured.value = !!(await db.adminCredentials.get('admin'))
}

export async function createAdminPin(pin: string) {
    validatePin(pin)

    if (await db.adminCredentials.get('admin')) {
        throw new Error('Admin access is already configured.')
    }

    const credential = await createCredential(pin)
    await db.adminCredentials.put(credential)
    isAdminConfigured.value = true
    unlockAdmin()
}

export async function loginAdmin(pin: string) {
    const credential = await db.adminCredentials.get('admin')
    if (!credential || !(await verifyPin(pin, credential))) return false

    unlockAdmin()
    return true
}

export async function changeAdminPin(currentPin: string, nextPin: string) {
    validatePin(nextPin)
    const credential = await db.adminCredentials.get('admin')

    if (!credential || !(await verifyPin(currentPin, credential))) return false

    await db.adminCredentials.put(await createCredential(nextPin))
    return true
}

export function lockAdmin() {
    isAdminUnlocked.value = false
    clearTimeout(idleTimer)
    idleTimer = undefined

    if (activityListenersAttached && typeof window !== 'undefined') {
        for (const eventName of activityEvents) {
            window.removeEventListener(eventName, resetIdleTimer)
        }
        activityListenersAttached = false
    }
}

function unlockAdmin() {
    isAdminUnlocked.value = true

    if (typeof window !== 'undefined' && !activityListenersAttached) {
        for (const eventName of activityEvents) {
            window.addEventListener(eventName, resetIdleTimer, { passive: true })
        }
        activityListenersAttached = true
    }

    resetIdleTimer()
}

const activityEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'wheel']

function resetIdleTimer() {
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
        lockAdmin()
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('admin-idle-lock'))
        }
    }, IDLE_TIMEOUT_MS)
}

function validatePin(pin: string) {
    if (!/^\d+$/.test(pin) || pin.length < MIN_PIN_LENGTH || pin.length > MAX_PIN_LENGTH) {
        throw new Error(`Use a ${MIN_PIN_LENGTH}-${MAX_PIN_LENGTH} digit PIN.`)
    }
}

async function createCredential(pin: string): Promise<AdminCredential> {
    const saltBytes = crypto.getRandomValues(new Uint8Array(16))
    const salt = bytesToHex(saltBytes)

    return {
        id: 'admin',
        salt,
        verifier: await deriveVerifier(pin, salt, PIN_ITERATIONS),
        iterations: PIN_ITERATIONS
    }
}

async function verifyPin(pin: string, credential: AdminCredential) {
    if (!/^\d+$/.test(pin) || pin.length < MIN_PIN_LENGTH || pin.length > MAX_PIN_LENGTH) return false

    const candidate = await deriveVerifier(pin, credential.salt, credential.iterations)
    if (candidate.length !== credential.verifier.length) return false

    let difference = 0
    for (let index = 0; index < candidate.length; index += 1) {
        difference |= candidate.charCodeAt(index) ^ credential.verifier.charCodeAt(index)
    }
    return difference === 0
}

async function deriveVerifier(password: string, salt: string, iterations: number) {
    if (!globalThis.isSecureContext || !crypto.subtle) {
        throw new Error('Admin access requires HTTPS (or localhost) so the browser can securely hash passwords.')
    }

    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits({
        name: 'PBKDF2',
        salt: hexToBytes(salt),
        iterations,
        hash: 'SHA-256'
    }, key, 256)

    return bytesToHex(new Uint8Array(bits))
}

function bytesToHex(bytes: Uint8Array) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(value: string) {
    return new Uint8Array(value.match(/.{2}/g)?.map(pair => Number.parseInt(pair, 16)) ?? [])
}
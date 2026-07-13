import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

export async function initPushNotifications(onToken: (token: string) => void) {
  if (!Capacitor.isNativePlatform()) return // no-op in the browser/PWA context

  const permission = await PushNotifications.requestPermissions()
  if (permission.receive !== 'granted') return

  await PushNotifications.register()

  PushNotifications.addListener('registration', (token) => {
    onToken(token.value)
  })

  PushNotifications.addListener('registrationError', (err) => {
    console.error('Push registration failed:', err)
  })
}
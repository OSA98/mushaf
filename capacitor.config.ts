import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'org.mushaf.app', // TODO: change to your own reverse-domain id before publishing
  appName: 'مصحف الأزهر الشريف',
  webDir: 'dist',
  backgroundColor: '#fffffd',
  android: { allowMixedContent: false },
}

export default config

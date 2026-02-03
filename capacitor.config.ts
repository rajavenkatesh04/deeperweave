import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deeperweave.app',
  appName: 'DeeperWeave',
  webDir: 'public',
  server: {
    url: 'https://www.deeperweave.com/', // Your live URL
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#ffffff",
    },
    // 👇 ADD THIS BLOCK
    StatusBar: {
      overlaysWebView: false, // 🛑 STOP drawing behind the status bar
      style: 'DARK', // or 'LIGHT' depending on your preference
      backgroundColor: '#000000', // Match this to your app theme
    },
  },
};

export default config;
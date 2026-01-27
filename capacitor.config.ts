import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deeperweave.app', // Must match what you typed in init
  appName: 'DeeperWeave',
  webDir: 'public', // This is just a placeholder, don't worry about it
  server: {
    // ⚠️ REPLACE THIS with your actual deployed URL!
    // If you don't have a domain yet, use your vercel.app link.
    url: 'https://www.deeperweave.com/',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000", // Dark mode background
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#ffffff",
    },
  },
};

export default config;
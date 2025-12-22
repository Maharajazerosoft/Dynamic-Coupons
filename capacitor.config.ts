import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.starter",
  appName: "DynamicCoupons",
  webDir: "www",
  bundledWebRuntime: false,

  plugins: {
    AdMob: {
      appId: "YOUR_ADMOB_APP_ID",
    },

    SplashScreen: {
      launchShowDuration: 3000, // 👈 3 seconds
      launchAutoHide: false,
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
  },
};

export default config;

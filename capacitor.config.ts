import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.starter",
  appName: "DynamicCoupons",
  webDir: "www",
  bundledWebRuntime: false,

  plugins: {
    StatusBar: {
      style: "Dark",
      overlaysWebView: false,
      backgroundColor: "#1ac1ee",
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

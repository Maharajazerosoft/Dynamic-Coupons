import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.starter",
  appName: "dynamic-coupons-new",
  webDir: "www",
  bundledWebRuntime: false,
  plugins: {
    AdMob: {
      appId: "YOUR_ADMOB_APP_ID",
    },
  },
};

export default config;

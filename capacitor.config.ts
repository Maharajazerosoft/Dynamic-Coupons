import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dynamic.dynamiccoupons",
  appName: "DynamicCoupons",
  webDir: "www",
  plugins: {
    StatusBar: {
      style: "Dark",
      overlaysWebView: false,
      backgroundColor: "#08b8da",
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#000",
      iosScaleType: "CENTER_CROP",
      showSpinner: false,
    } 
  },
};

export default config;

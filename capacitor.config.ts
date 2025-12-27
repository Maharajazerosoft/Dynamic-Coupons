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
      launchShowDuration: 0,
      launchAutoHide: false,
      showSpinner: false,
      backgroundColor: "#08b8da",
    }    
  },
};

export default config;

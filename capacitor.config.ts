import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.myapp',
  appName: 'appName',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
     
      // Add hash to local ident name
      localsConvention: 'camelCaseOnly',
    }
  }
})
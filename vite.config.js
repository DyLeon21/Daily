import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' sorgt dafür, dass die App unter jedem GitHub-Pages-Pfad läuft
// (z.B. https://DEINNAME.github.io/bibelreise/)
export default defineConfig({
  plugins: [react()],
  base: './',
});

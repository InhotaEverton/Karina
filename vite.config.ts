import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({plugins:[react(),VitePWA({registerType:'autoUpdate',includeAssets:[],manifest:{name:'Kavelar Feminine Beaty',short_name:'Kavelar',description:'Gestão financeira do salão',theme_color:'#7c3aed',background_color:'#f8fafc',display:'standalone',start_url:'/',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]}})]});



export const APP_CONFIG = {
  META: {
    name: 'Geo-Fence',
    description: '',
    shortDescription: '',
    keywords: 'Geo-Fence,',
    app: {
      background: '#26323b',
    },
  },
  PROD_BASE_URL: '',
};

export const META_TAGS = [
  {
    name: 'keywords',
    content: APP_CONFIG.META.keywords,
  },
  {
    name: 'name',
    content: `${APP_CONFIG.META.name} • ${APP_CONFIG.META.shortDescription}`,
  },
  {
    name: 'description',
    content: APP_CONFIG.META.description,
  },
  {
    name: 'image',
    content: `${APP_CONFIG.PROD_BASE_URL}/banner.png`,
  },
  
  // PWA
  {
    name: 'theme-color',
    content: APP_CONFIG.META.app.background,
  },
  {
    name: 'mask-icon',
    content: '/icons/icon-512-512.png',
    color: APP_CONFIG.META.app.background,
  },
];

export const PWA_CONFIG = {
  base: '/',
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
  manifest: {
    name: APP_CONFIG.META.name,
    short_name: APP_CONFIG.META.name,
    description: APP_CONFIG.META.shortDescription,
    background_color: APP_CONFIG.META.app.background,
    theme_color: APP_CONFIG.META.app.background,
    start_url: '.',
    orientation: 'any',
    display: 'standalone',
    icons: [
      {
        src: '/icons/icon-512-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-192-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-144-144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-96-96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-72-72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-48-48.png',
        sizes: '48x48',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  workbox: {
    sourcemap: false,
    cleanupOutdatedCaches: true,
    maximumFileSizeToCacheInBytes: 4194304,
    globPatterns: ['**/*.{html,css,js,svg,png,ico,json,woff2,txt}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      
    ],
  },
};

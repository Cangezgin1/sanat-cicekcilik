proxy: {
  '/api': {
    target: 'https://sanat-cicekcilik-backend.onrender.com',
    changeOrigin: true,
  },
  '/uploads': {
    target: 'https://sanat-cicekcilik-backend.onrender.com',
    changeOrigin: true,
  }
}
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('../sw_cached_site.js', {
          updateViaCache: 'none'
        })
        .then(reg => console.log('Service Worker: Registered (Pages)'))
        .catch(err => console.log(`Service Worker: Error: ${err}`));
    });
  }
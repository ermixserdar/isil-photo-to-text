// PWA utilities for IŞIL OCR App

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              showUpdateNotification();
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

export const showUpdateNotification = () => {
  if (confirm('Yeni bir sürüm mevcut. Güncellemek ister misiniz?')) {
    window.location.reload();
  }
};

export const checkInstallPrompt = () => {
  let deferredPrompt: any = null;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    showInstallButton(deferredPrompt);
  });
};

export const showInstallButton = (deferredPrompt: any) => {
  const installButton = document.createElement('button');
  installButton.textContent = 'Uygulamayı Yükle';
  installButton.className = 'fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 hover:bg-primary/90 transition-colors';
  
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
      installButton.remove();
    }
  });
  
  // Add to DOM if not already present
  if (!document.querySelector('[data-install-button]')) {
    installButton.setAttribute('data-install-button', 'true');
    document.body.appendChild(installButton);
  }
};

export const isStandalone = () => {
  return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
};

export const isiOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const showIOSInstallInstructions = () => {
  if (isiOS() && !isStandalone()) {
    const instructions = document.createElement('div');
    instructions.innerHTML = `
      <div class="fixed top-4 left-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50">
        <p class="text-sm mb-2">Bu uygulamayı ana ekranınıza ekleyin:</p>
        <p class="text-xs">1. Safari'de paylaş butonuna (↗) tıklayın</p>
        <p class="text-xs">2. "Ana Ekrana Ekle"yi seçin</p>
        <button onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-primary-foreground/80 hover:text-primary-foreground">✕</button>
      </div>
    `;
    document.body.appendChild(instructions);
    
    // Auto hide after 10 seconds
    setTimeout(() => {
      if (instructions.parentElement) {
        instructions.remove();
      }
    }, 10000);
  }
};

// File System Access API support (for desktop)
export const supportsFileSystemAccess = () => {
  return 'showOpenFilePicker' in window;
};

// Offline capabilities
export const isOnline = () => {
  return navigator.onLine;
};

export const setupOfflineDetection = () => {
  window.addEventListener('online', () => {
    console.log('Connection restored');
    // Show online indicator
    showNetworkStatus('online');
  });
  
  window.addEventListener('offline', () => {
    console.log('Connection lost');
    // Show offline indicator
    showNetworkStatus('offline');
  });
};

const showNetworkStatus = (status: 'online' | 'offline') => {
  const statusElement = document.createElement('div');
  statusElement.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-sm z-50 ${
    status === 'online' 
      ? 'bg-success text-success-foreground' 
      : 'bg-destructive text-destructive-foreground'
  }`;
  statusElement.textContent = status === 'online' ? 'Bağlantı yeniden kuruldu' : 'Çevrimdışı mod';
  
  document.body.appendChild(statusElement);
  
  setTimeout(() => {
    if (statusElement.parentElement) {
      statusElement.remove();
    }
  }, 3000);
};
import re

with open('frontend/app/settings/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

pwa_logic_new = """
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
    
    // PWA Install Logic
    let deferredPrompt;
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtn = document.getElementById('install-pwa-btn');
      if (installBtn) {
        installBtn.onclick = async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
          }
        };
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Detection
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    const isStandalone = () => {
      return ('standalone' in window.navigator) && window.navigator.standalone;
    };
    
    const installBtn = document.getElementById('install-pwa-btn');
    if (installBtn && isIos() && !isStandalone()) {
       installBtn.onclick = () => setShowIosPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [router]);
"""

page = page.replace("const [mounted, setMounted] = useState(false);", pwa_logic_new.strip())

# Remove the old useEffect for mounted and PWA
old_effect = """
  useEffect(() => {
    let deferredPrompt;
    
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtn = document.getElementById('install-pwa-btn');
      if (installBtn) {
        installBtn.style.display = 'flex';
        installBtn.onclick = async () => {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
        };
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [router]);
"""
page = page.replace(old_effect.strip(), '')

# Add iOS Modal
ios_modal = """
      <main className="flex-1 w-full max-w-[800px] mx-auto p-6 md:p-12">
        {showIosPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface border border-border p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
              <button onClick={() => setShowIosPrompt(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">✕</button>
              <h3 className="text-lg font-medium mb-3">Install on iOS</h3>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                To install SatyaLabel as an app on your iPhone or iPad:
              </p>
              <ol className="list-decimal pl-5 text-sm text-text-secondary space-y-2 mb-6">
                <li>Tap the <strong>Share</strong> icon <span className="inline-block border border-border px-1.5 py-0.5 rounded ml-1 bg-background">↑</span> at the bottom of Safari.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong> <span className="inline-block border border-border px-1.5 py-0.5 rounded ml-1 bg-background">+</span>.</li>
              </ol>
              <button onClick={() => setShowIosPrompt(false)} className="w-full py-2.5 bg-primary text-background rounded-xl font-medium">Got it</button>
            </div>
          </div>
        )}
"""

page = page.replace('<main className="flex-1 w-full max-w-[800px] mx-auto p-6 md:p-12">', ios_modal.strip())

with open('frontend/app/settings/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)

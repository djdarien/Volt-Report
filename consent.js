// Simple consent banner for ads and analytics
// Stores consent in localStorage key: 'simplifynews_consent_ads'

(function(){
  const CONSENT_KEY = 'simplifynews_consent_ads';

  function hasConsent(){
    return localStorage.getItem(CONSENT_KEY) === 'granted';
  }

  function setConsent(val){
    localStorage.setItem(CONSENT_KEY, val ? 'granted' : 'denied');
  }

  function createBanner(){
    const banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.innerHTML = `
      <div class="consent-inner">
        <div class="consent-copy">
          <strong>Simplify EV News</strong> uses ads to support the site. Do you accept loading ads and analytics on this device?
        </div>
        <div class="consent-actions">
          <button id="consent-accept" class="btn primary">Accept</button>
          <button id="consent-decline" class="btn">Decline</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('consent-accept').addEventListener('click', ()=>{
      setConsent(true);
      removeBanner();
      loadAdsIfNeeded();
    });
    document.getElementById('consent-decline').addEventListener('click', ()=>{
      setConsent(false);
      removeBanner();
    });
  }

  function removeBanner(){
    const b = document.getElementById('consent-banner');
    if(b) b.remove();
  }

  function loadAdsScript(){
    if(window.adsbygoogle) return; // already loaded
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3211630470920033';
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);

    s.onload = ()=>{
      // push ad slots
      try{
        (adsbygoogle = window.adsbygoogle || []).push({});
      }catch(e){console.warn('ads load push failed', e)}
    }
  }

  function loadAdsIfNeeded(){
    if(hasConsent()){
      loadAdsScript();
      // Trigger any existing ad slots: loop through INS tags and push
      document.querySelectorAll('ins.adsbygoogle').forEach(()=>{
        try{ (adsbygoogle = window.adsbygoogle || []).push({}); }catch(e){}
      });
    }
  }

  // Simple style for banner (small, will be overridden by style.css if present)
  const style = document.createElement('style');
  style.textContent = `
    #consent-banner{position:fixed;left:0;right:0;bottom:18px;background:#111;color:#fff;padding:12px 16px;border-radius:10px;margin:0 auto;max-width:980px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.3)}
    .consent-inner{display:flex;align-items:center;justify-content:space-between;gap:12px}
    .consent-copy{font-size:14px}
    .consent-actions .btn{margin-left:8px}
    .btn{padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#fff;cursor:pointer}
    .btn.primary{background:#cc0000;border-color:#cc0000}
  `;
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', ()=>{
    if(!localStorage.getItem(CONSENT_KEY)){
      createBanner();
    } else {
      // If already granted, ensure ads loaded
      loadAdsIfNeeded();
    }
  });

  // Expose helper
  window.simplifynewsConsent = {
    hasConsent,
    setConsent: (v)=>{ setConsent(v); if(v) loadAdsIfNeeded(); }
  };
})();

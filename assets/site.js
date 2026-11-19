/* Ecclesia Mater — funzioni del prototipo. Non invia richieste sul server. */
(()=>{
  'use strict';
  let contactEmail='info@madrice.it';
  const menuBtn=document.querySelector('.nav-toggle');
  const menu=document.querySelector('.nav-main');
  const closeMenu=()=>{if(menu&&menuBtn){menu.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.setAttribute('aria-label','Apri il menu')}};
  if(menu&&menuBtn){menuBtn.addEventListener('click',()=>{const isOpen=menu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(isOpen));menuBtn.setAttribute('aria-label',isOpen?'Chiudi il menu':'Apri il menu')});menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()})}
  document.querySelectorAll('.filter-options').forEach(group=>{const buttons=[...group.querySelectorAll('[data-filter-year]')];buttons.forEach(btn=>btn.addEventListener('click',()=>{const val=btn.dataset.filterYear;buttons.forEach(x=>{const hit=x===btn;x.classList.toggle('selected',hit);x.setAttribute('aria-pressed',String(hit))});document.querySelectorAll('.timeline-card[data-year],.media-event[data-year]').forEach(card=>{card.hidden=(val!=='tutti'&&card.dataset.year!==val)})}))});
  const dlg=document.querySelector('#image-modal');
  if(dlg&&typeof dlg.showModal==='function'){
    const picture=dlg.querySelector('img');const caption=dlg.querySelector('p');
    document.querySelectorAll('a.lightbox-link').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();picture.src=link.href;picture.alt=link.querySelector('img')?.alt||'Fotografia';caption.textContent=link.dataset.title||'';dlg.showModal()}));
    dlg.querySelector('.modal-close')?.addEventListener('click',()=>dlg.close());
    dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
    dlg.addEventListener('close',()=>{picture.removeAttribute('src')});
  }
  document.querySelectorAll('[data-purpose]').forEach(link=>link.addEventListener('click',()=>{const el=document.querySelector('#topic');if(el)el.value=link.dataset.purpose}));
  const join=document.querySelector('#join-form');
  if(join){const desired=new URLSearchParams(location.search).get('interesse');if(desired&&[...join.querySelector('#topic').options].some(o=>o.value===desired))join.querySelector('#topic').value=desired;join.addEventListener('submit',e=>{e.preventDefault();const status=document.querySelector('#form-status');const name=join.querySelector('#fullname');const email=join.querySelector('#email');const topic=join.querySelector('#topic');const audience=join.querySelector('#audience');const message=join.querySelector('#message');const valid=name.value.trim().length>=2&&email.validity.valid&&email.value.trim();status.className='form-status';if(!valid){status.classList.add('error');status.textContent='Inserisci nome e un indirizzo email valido per preparare il messaggio.';(name.value.trim().length<2?name:email).focus();return}const subject=`Per la Corale Ecclesia Mater — ${topic.value}`;const body=`Buongiorno,\n\nVorrei chiedere informazioni riguardo: ${topic.value}.\n\nNome: ${name.value.trim()}\nEmail di risposta: ${email.value.trim()}\nTipologia di richiesta: ${audience.value}\n\n${message.value.trim()}\n\nCordiali saluti.`;status.classList.add('success');status.textContent='Messaggio preparato. Si aprirà il tuo programma di posta elettronica: verifica il destinatario e premi Invia per spedirlo.';location.href=`mailto:${window.ecclesiaContactEmail||contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`})}
  document.querySelectorAll('.video-load').forEach(btn=>btn.addEventListener('click',()=>{const u=btn.dataset.videoUrl;const box=btn.closest('.video-preview');if(!u||!box)return;const frame=document.createElement('iframe');frame.src='https://www.facebook.com/plugins/video.php?href='+encodeURIComponent(u)+'&show_text=false&width=560';frame.title='Video Facebook — Il canto del mare, con la Corale Ecclesia Mater';frame.loading='lazy';frame.allow='autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.className='video-frame';box.replaceChildren(frame)}))
})();

/* Contenuti editoriali: i dati pubblici non contengono credenziali. */
(async()=>{
  const safeWeb = value => {
    try { const u=new URL(value,location.origin); return u.protocol==='https:'&&!u.username&&!u.password ? u.href : null; } catch{return null;}
  };
  try {
    const response=await fetch('/data/editor.json',{cache:'no-cache'});
    if(!response.ok)return;
    const data=await response.json();
    const route=(location.pathname.split('/').pop()||'index.html').replace(/^(index)?$/,'index.html');
    const page=Array.isArray(data.pages)?data.pages.find(p=>p.route===route||p.route===route+'.html'):null;
    if(page){
      const texts=[...document.querySelectorAll('main h1,main h2,main h3,main p,main address,.footer h2')];
      for(const item of page.texts||[]){
        if(!Number.isInteger(item.index)||typeof item.value!=='string')continue;
        const el=texts[item.index];
        if(el&&el.textContent.trim()!==item.value.trim()){
          const link=el.querySelector('a');
          if(link&&link.textContent.trim()===el.textContent.trim())link.textContent=item.value;
          else el.textContent=item.value;
        }
      }
      const images=[...document.querySelectorAll('main img')];
      for(const item of page.images||[]){
        const img=Number.isInteger(item.index)?images[item.index]:null;if(!img)continue;
        if(typeof item.alt==='string')img.alt=item.alt;
        if(!item.image)continue;
        const url=safeWeb(item.image);if(!url)continue;
        img.src=url;img.removeAttribute('srcset');
        const link=img.closest('a.lightbox-link');if(link)link.href=url;
      }
    }
    if(typeof data.contact_email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)){
      document.querySelectorAll('a[href^="mailto:"]').forEach(a=>{
        const old=a.getAttribute('href').slice(7).split('?')[0];
        a.href='mailto:'+data.contact_email;
        if(a.textContent.trim()===old)a.textContent=data.contact_email;
      });
      window.ecclesiaContactEmail=data.contact_email;
    }
    const socialBox=document.createElement('div');socialBox.className='cms-social-links';
    socialBox.style.cssText='display:flex;gap:1.25rem;flex-wrap:wrap;margin-top:1rem';
    for(const [key,label] of [['facebook','Facebook'],['instagram','Instagram'],['youtube','YouTube']]){
      const url=typeof data[key]==='string'&&data[key].trim()?safeWeb(data[key]):null;
      if(!url)continue;
      if(key==='facebook')document.querySelectorAll('a[href*="facebook.com"]').forEach(a=>{if(a.textContent.includes('Facebook ufficiale')||a.href.includes('/p/Associazione-Ecclesia-Mater-'))a.href=url});
      const a=document.createElement('a');a.href=url;a.textContent=label;a.target='_blank';a.rel='noopener noreferrer';socialBox.append(a);
    }
    if(socialBox.childElementCount)document.querySelector('.footer-top')?.append(socialBox);
  }catch(error){console.warn('Contenuti editoriali non disponibili; mantenuti i contenuti originali.');}
})();

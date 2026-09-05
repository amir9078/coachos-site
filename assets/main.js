(function(){
  // Mark JS as available — hidden/animated states in the CSS only apply under html.js,
  // so content stays visible if this file ever fails to run.
  document.documentElement.classList.add('js');

  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme: dark by default, light via toggle, remembered per visitor
  var themeBtn=document.querySelector('.theme-btn');
  function applyTheme(t){
    if(t==='light'){ document.documentElement.setAttribute('data-theme','light'); }
    else { document.documentElement.removeAttribute('data-theme'); }
    if(themeBtn){
      themeBtn.setAttribute('aria-checked', t==='light' ? 'true' : 'false');
      themeBtn.setAttribute('aria-label', t==='light' ? 'Switch to dark mode' : 'Switch to light mode');
    }
  }
  var saved=null;
  try{ saved=localStorage.getItem('coachos-theme'); }catch(e){}
  applyTheme(saved==='light'?'light':'dark');
  if(themeBtn){
    themeBtn.addEventListener('click',function(){
      var next=document.documentElement.getAttribute('data-theme')==='light'?'dark':'light';
      applyTheme(next);
      try{ localStorage.setItem('coachos-theme',next); }catch(e){}
    });
  }

  // Hero word stagger: split [data-words] lines into words with cascading delays
  document.querySelectorAll('.hero h1 .line>span').forEach(function(span,li){
    var words=span.textContent.split(' ');
    var em=span.querySelector('em');
    if(!em){
      span.innerHTML=words.map(function(w,i){
        return '<span class="w"><span style="transition-delay:'+((li*3+i)*70)+'ms">'+w+'</span></span>';
      }).join(' ');
    } else {
      // line is a single <em> — treat whole line as one unit with delay
      span.querySelectorAll('*').forEach(function(){});
      span.style.transitionDelay=(li*200)+'ms';
    }
  });
  function markLoaded(){ document.body.classList.add('loaded'); }
  requestAnimationFrame(function(){ requestAnimationFrame(markLoaded); });
  setTimeout(markLoaded, 400); // rAF doesn't fire in hidden tabs — never leave the hero blank

  // Header border on scroll
  var hd=document.querySelector('header.site');
  if(hd){
    addEventListener('scroll',function(){ hd.classList.toggle('scrolled',scrollY>10); },{passive:true});
  }

  // Mobile nav
  var tg=document.querySelector('.nav-toggle'),links=document.querySelector('.nav-links');
  if(tg&&links){
    tg.addEventListener('click',function(){
      var open=links.classList.toggle('open');
      tg.setAttribute('aria-expanded',open);
    });
  }

  // Mobile: expandable dropdown sections inside the hamburger menu
  document.querySelectorAll('.nav-item').forEach(function(item){
    if(!item.querySelector('.nav-drop')) return;
    var btn=document.createElement('button');
    btn.type='button'; btn.className='nd-toggle'; btn.innerHTML='▾';
    btn.setAttribute('aria-label','Show section links');
    btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click',function(){
      var open=item.classList.toggle('open');
      btn.setAttribute('aria-expanded',open?'true':'false');
    });
    item.appendChild(btn);
  });

  // Marquee: duplicate track content once for a seamless loop
  document.querySelectorAll('.marquee .track').forEach(function(track){
    track.innerHTML+=track.innerHTML;
  });

  // Reveal on scroll.
  // threshold must stay 0: a section taller than ~8x the viewport can never
  // reach a 12% visible ratio on a phone, and would stay opacity:0 forever.
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:0});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  // Count-up stats
  var co=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      co.unobserve(e.target);
      if(reduce) return;
      var el=e.target,to=+el.dataset.countTo,suf=el.dataset.countSuffix||'',t0=null;
      function step(t){
        if(!t0) t0=t;
        var p=Math.min((t-t0)/1100,1);
        var v=Math.round(to*(1-Math.pow(1-p,3)));
        el.textContent=v.toLocaleString('en-US')+suf;
        if(p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  },{threshold:.6});
  document.querySelectorAll('[data-count-to]').forEach(function(el){ co.observe(el); });

  // Desk activity feed: rotate a fresh item onto the top every few seconds
  var feedList=document.getElementById('feed-list');
  if(feedList && !reduce){
    var pool=[
      {ic:'✉', html:'<b>Pipeline Agent</b> drafted follow-up — quiet 6 days after discovery call', t:'now'},
      {ic:'📣', html:'<b>Marketing Studio</b> queued 4 LinkedIn drafts from Voice &amp; Rules', t:'2m'},
      {ic:'📄', html:'<b>Agreement</b> pre-filled from accepted proposal — awaiting sign-off', t:'5m'},
      {ic:'✍', html:'<b>Client delivery</b> session summary drafted — approval queue', t:'8m'},
      {ic:'💰', html:'<b>Stripe invoice</b> raised — Autopilot reminder armed', t:'11m'},
      {ic:'📅', html:'<b>Booking</b> confirmed — prep brief scheduled 30 min before session', t:'14m'},
      {ic:'🔁', html:'<b>Autopilot</b> touch 3 of 8 on open proposal', t:'17m'}
    ];
    var idx=0;
    setInterval(function(){
      if(document.hidden) return;
      idx=(idx+1)%pool.length;
      var it=pool[idx];
      var li=document.createElement('li');
      li.className='fresh';
      li.innerHTML='<span class="ic">'+it.ic+'</span><span>'+it.html+'</span><span class="t">'+it.t+'</span>';
      feedList.insertBefore(li,feedList.firstChild);
      while(feedList.children.length>5) feedList.removeChild(feedList.lastChild);
    },3400);
  }

  // Contact form -> mailto
  var form=document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit',function(ev){
      ev.preventDefault();
      var name=document.getElementById('c-name').value.trim();
      var email=document.getElementById('c-email').value.trim();
      var topic=document.getElementById('c-topic');
      var msg=document.getElementById('c-message').value.trim();
      var subject='Evensteer — '+topic.options[topic.selectedIndex].text;
      var body=msg+'\n\n— '+name+' ('+email+')';
      location.href='mailto:shaikhamirhussain2000@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    });
  }
})();

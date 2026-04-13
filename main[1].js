/* ========================================================
   CAQTEERS — main.js
   ======================================================== */

// ── NAV ──────────────────────────────────────────────────
function navigateTo(pageId, skipHistory) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById(pageId);
  if (pg) pg.classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a =>
    a.classList.toggle('active', a.dataset.page === pageId));
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (!skipHistory) history.pushState({ page: pageId }, '', '#' + pageId);
  closeMob();
  setTimeout(initFades, 80);
}

function toggleMob() { document.getElementById('mobMenu').classList.toggle('open'); }
function closeMob()   { document.getElementById('mobMenu').classList.remove('open'); }
window.addEventListener('popstate', e =>
  navigateTo((e.state && e.state.page) || 'home', true));

// ── SCROLL ───────────────────────────────────────────────
window.addEventListener('scroll', () =>
  document.querySelector('.navbar').classList.toggle('scrolled', scrollY > 20));

// ── FADE-UP OBSERVER ─────────────────────────────────────
function initFades() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up:not(.visible)').forEach(el => obs.observe(el));
}

// ── CART ─────────────────────────────────────────────────
let cart = [];

function addToCart(name, price, qty) {
  qty = qty || 1;
  const ex = cart.find(i => i.name === name);
  if (ex) ex.qty += qty; else cart.push({ name, price, qty });
  renderCart();
  toast('✓ ' + name + ' added!');
}

function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  renderCart();
}

function renderCart() {
  const wrap = document.getElementById('cartItems');
  const totEl = document.getElementById('cartTotal');
  if (!wrap) return;
  if (!cart.length) {
    wrap.innerHTML = '<p class="cart-empty">No items yet — browse & add!</p>';
    if (totEl) totEl.textContent = '₹0';
    return;
  }
  wrap.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">${i.name}</div>
        <div class="cart-item-qty">Qty: ${i.qty}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="cart-item-price">₹${(i.price * i.qty).toLocaleString()}</span>
        <button class="cart-remove" onclick="removeFromCart('${i.name.replace(/'/g,"\\'")}')">×</button>
      </div>
    </div>`).join('');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (totEl) totEl.textContent = '₹' + total.toLocaleString();
}

function sendOrderWA() {
  if (!cart.length) { alert('Please add items first!'); return; }
  const name  = (document.getElementById('oName')  || {}).value?.trim();
  const phone = (document.getElementById('oPhone') || {}).value?.trim();
  const date  = (document.getElementById('oDate')  || {}).value;
  const slot  = (document.getElementById('oSlot')  || {}).value;
  const note  = (document.getElementById('oNote')  || {}).value?.trim();
  if (!name || !phone) { alert('Please enter your name and WhatsApp number.'); return; }
  const lines = cart.map(i => `• ${i.name} × ${i.qty} = ₹${(i.price*i.qty).toLocaleString()}`).join('\n');
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const msg = `Hi Ananya! Order from Caqteers 🎂\n\n${lines}\n\n*Total: ₹${total.toLocaleString()}*\n\n📛 ${name}\n📱 ${phone}${date?'\n📅 '+date:''}${slot?'\n🕒 '+slot:''}${note?'\n📝 '+note:''}\n\nPlease confirm!`;
  window.open('https://wa.me/919937099999?text='+encodeURIComponent(msg), '_blank');
}

// ── PRODUCT QTY COUNTERS (page-level, separate from cart) ─
const pageQty = {};

function changePageQty(id, delta) {
  pageQty[id] = Math.max(0, (pageQty[id] || 0) + delta);
  const el = document.getElementById('pqty_' + id);
  if (el) el.textContent = pageQty[id];
}

function addQtyToCart(name, price, qtyId) {
  const q = pageQty[qtyId] || 1;
  addToCart(name, price, q);
  pageQty[qtyId] = 0;
  const el = document.getElementById('pqty_' + qtyId);
  if (el) el.textContent = 0;
  navigateTo('order');
}

// ── BOX BUILDER ──────────────────────────────────────────
const BOX_ITEMS = [
  { id:'cup',  name:'Cupcake',  emoji:'🧁', price:50 },
  { id:'mac',  name:'Macaron',  emoji:'🫧', price:80 },
  { id:'bro',  name:'Brownie',  emoji:'🍫', price:45 },
  { id:'coo',  name:'Cookie',   emoji:'🍪', price:35 },
  { id:'pop',  name:'Cake Pop', emoji:'🍭', price:60 },
  { id:'muf',  name:'Muffin',   emoji:'🥐', price:55 },
  { id:'tru',  name:'Truffle',  emoji:'⚫', price:40 },
  { id:'bis',  name:'Biscuit',  emoji:'🫐', price:30 },
];
let boxQty = {};

function renderBox() {
  const grid = document.getElementById('boxGrid');
  if (!grid) return;
  grid.innerHTML = BOX_ITEMS.map(it => `
    <div class="box-item ${(boxQty[it.id]||0)>0?'selected':''}" id="bi_${it.id}">
      <span class="box-item-emoji">${it.emoji}</span>
      <div class="box-item-name">${it.name}</div>
      <div class="box-item-price">₹${it.price}/pc</div>
      <div class="box-qty-wrap">
        <button class="box-qty-btn" onclick="chBox('${it.id}',-1)">−</button>
        <span class="box-qty-num" id="bq_${it.id}">${boxQty[it.id]||0}</span>
        <button class="box-qty-btn" onclick="chBox('${it.id}',1)">+</button>
      </div>
    </div>`).join('');
}

function chBox(id, d) {
  boxQty[id] = Math.max(0, (boxQty[id]||0)+d);
  const qEl = document.getElementById('bq_'+id);
  const iEl = document.getElementById('bi_'+id);
  if (qEl) qEl.textContent = boxQty[id];
  if (iEl) iEl.classList.toggle('selected', boxQty[id]>0);
  updateBoxSummary();
}

function updateBoxSummary() {
  let tot=0, cnt=0;
  BOX_ITEMS.forEach(it => { tot+=(boxQty[it.id]||0)*it.price; cnt+=(boxQty[it.id]||0); });
  const ta=document.getElementById('boxTot'); if(ta) ta.textContent='₹'+tot.toLocaleString();
  const ca=document.getElementById('boxCnt'); if(ca) ca.textContent=cnt+' item'+(cnt!==1?'s':'');
}

function resetBox() { boxQty={}; renderBox(); updateBoxSummary(); }

function orderBox() {
  const sel = BOX_ITEMS.filter(it=>(boxQty[it.id]||0)>0);
  if(!sel.length) { alert('Add at least one item to your box!'); return; }
  const tot = BOX_ITEMS.reduce((s,it)=>s+(boxQty[it.id]||0)*it.price,0);
  const lines = sel.map(it=>`${it.emoji} ${it.name} × ${boxQty[it.id]} = ₹${(boxQty[it.id]*it.price).toLocaleString()}`).join('\n');
  const msg = `Hi Ananya! Custom box order from Caqteers! 🎁\n\n${lines}\n\n*Box Total: ₹${tot.toLocaleString()}*\n\nPlease confirm!`;
  window.open('https://wa.me/919937099999?text='+encodeURIComponent(msg),'_blank');
}

// ── WORKSHOP BOOKING ─────────────────────────────────────
function submitWorkshop(e) {
  e.preventDefault();
  const n = document.getElementById('wName').value.trim();
  const p = document.getElementById('wPhone').value.trim();
  const w = document.getElementById('wType').value;
  const pax = document.getElementById('wPax').value;
  const d = document.getElementById('wDate').value;
  const nt = document.getElementById('wNote').value.trim();
  if(!n||!p||!w){ alert('Please fill required fields.'); return; }
  const msg=`Hi Ananya! Workshop booking from Caqteers 🎨\n\n📛 ${n}\n📱 ${p}\n🎂 ${w}\n👥 ${pax} participant(s)${d?'\n📅 '+d:''}${nt?'\n📝 '+nt:''}\n\nPlease confirm my slot!`;
  window.open('https://wa.me/919937099999?text='+encodeURIComponent(msg),'_blank');
  document.getElementById('workshopForm').style.display='none';
  document.getElementById('workshopSuccess').style.display='block';
}

// ── REFERRAL ─────────────────────────────────────────────
function shareRef() {
  const code = (document.getElementById('refCode')||{}).textContent || 'CAQT25';
  const msg = `Hey! Order from Caqteers 🎂 — best home bakery in BJB Nagar, Bhubaneswar!\nUse my code *${code}* for ₹50 off your first order!\nWhatsApp: https://wa.me/919937099999`;
  if (navigator.share) { navigator.share({ title:'Caqteers', text:msg }); }
  else { navigator.clipboard.writeText(msg).then(()=>alert('Copied! Share it with friends.')); }
}

// ── LIGHTBOX ─────────────────────────────────────────────
function openLB(src) {
  document.getElementById('lbImg').src = src;
  document.getElementById('lightbox').classList.add('open');
}
function closeLB() { document.getElementById('lightbox').classList.remove('open'); }

// ── TOAST ────────────────────────────────────────────────
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.transform = 'translateY(0)'; el.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.style.transform='translateY(16px)'; el.style.opacity='0'; }, 2200);
}

// ── TAB SWITCHING ────────────────────────────────────────
function switchTab(e, prefix, cat) {
  const bar = e.target.closest('.tab-bar');
  bar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  document.querySelectorAll('[id^="' + prefix + '-"]').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(prefix + '-' + cat);
  if (target) target.classList.add('active');
}

// ── CONFETTI CANVAS ───────────────────────────────────────
function initConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pieces = [];
  const COLORS = ['#FF6B9D','#FFD93D','#06D6A0','#845EC2','#4D96FF','#FF9F1C','#FF4757'];
  const SHAPES = ['rect','circle','ribbon'];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 85; i++) {
    pieces.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 2 - window.innerHeight,
      r: Math.random() * 8 + 3,
      d: Math.random() * 1.5 + 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      tilt: Math.random() * 30 - 15,
      tiltSpeed: Math.random() * 0.1 + 0.03,
      angle: Math.random() * Math.PI * 2,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
      } else if (p.shape === 'ribbon') {
        ctx.fillRect(-p.r * 2, -p.r * 0.4, p.r * 4, p.r * 0.8);
      } else {
        ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
      }
      ctx.restore();
    });
    pieces.forEach(p => {
      p.y += p.d;
      p.angle += p.tiltSpeed;
      p.x += Math.sin(p.angle) * 0.7;
      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── SET MIN DATE ─────────────────────────────────────────
function setMinDates() {
  const d = new Date(); d.setDate(d.getDate() + 2);
  const min = d.toISOString().split('T')[0];
  ['oDate','wDate','preDate'].forEach(id => {
    const el = document.getElementById(id); if (el) el.min = min;
  });
}

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#','') || 'home';
  navigateTo(hash, true);
  initFades();
  renderBox();
  setMinDates();
  initConfetti();
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeLB(); });
  document.getElementById('lightbox')?.addEventListener('click', function(e){ if(e.target===this) closeLB(); });
});

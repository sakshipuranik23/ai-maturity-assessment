/* ═══════════════════════════════════════════════════════════════
   AIT — auth.js
   ═══════════════════════════════════════════════════════════════ */
AIT.Auth = (function(){
  function login(email, password){
    var user = AIT.USERS.find(function(u){ return u.email === email && u.password === password; });
    if(!user) return { ok:false, error:'Invalid email or password.' };
    AIT.DB.Session.set({ userId: user.id, role: user.role, name: user.name, email: user.email });
    return { ok:true, user:user };
  }
  function loginCode(code){
    var slot = AIT.DB.Slots.byCode(code.trim());
    if(!slot) return { ok:false, error:'Invalid access code. Please check and try again.' };
    var client = AIT.DB.Clients.byId(slot.clientId);
    var asmt   = AIT.DB.Assessments.byClient(slot.clientId);
    if(!client || !asmt) return { ok:false, error:'Assessment not found for this code.' };
    AIT.DB.Session.set({ role:'evaluator', slotId: slot.id, slotNumber: slot.slotNumber, evaluatorRole: slot.role, clientId: slot.clientId, assessmentId: asmt.id, clientName: client.name });
    return { ok:true, slot:slot };
  }
  function logout(){ AIT.DB.Session.clear(); }
  function current(){ return AIT.DB.Session.get(); }
  return { login, loginCode, logout, current };
})();


/* ═══════════════════════════════════════════════════════════════
   AIT — utils.js
   ═══════════════════════════════════════════════════════════════ */
AIT.Utils = (function(){
  function el(tag, cls, html){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html !== undefined) e.innerHTML = html;
    return e;
  }
  function qs(sel, ctx){ return (ctx||document).querySelector(sel); }
  function qsa(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }
  function on(el, ev, fn){ el && el.addEventListener(ev, fn); }
  function toast(msg, type){
    type = type || 'info';
    var t = document.createElement('div');
    t.className = 'ait-toast ait-toast--' + type;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.classList.add('show'); }, 10);
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 300); }, 3000);
  }
  function formatDate(iso){
    if(!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  }
  function avg(arr){
    var valid = arr.filter(function(v){ return v !== null && v !== undefined; });
    if(!valid.length) return null;
    return Math.round((valid.reduce(function(a,b){ return a+b; },0) / valid.length) * 10) / 10;
  }
  function statusBadge(status, deadline){
    var labels = {
      pending:     ['Pending', 'badge--gray'],
      in_progress: ['In Progress', 'badge--blue'],
      submitted:   ['Submitted', 'badge--green'],
      active:      ['Active', 'badge--blue'],
      completed:   ['Completed', 'badge--green'],
      onboarding_template: ['Awaiting Template', 'badge--yellow'],
      onboarding_review:   ['Under Review', 'badge--orange'],
      approved:    ['Approved', 'badge--green'],
      rejected:    ['Rejected', 'badge--red']
    };
    var now = new Date();
    var overdue = deadline && status !== 'submitted' && status !== 'completed' && new Date(deadline) < now;
    var info = labels[status] || [status, 'badge--gray'];
    var html = '<span class="badge ' + info[1] + '">' + info[0] + '</span>';
    if(overdue) html += ' <span class="badge badge--red">Overdue</span>';
    return html;
  }
  return { el, qs, qsa, on, toast, formatDate, avg, statusBadge };
})();


/* ═══════════════════════════════════════════════════════════════
   AIT — modal.js
   ═══════════════════════════════════════════════════════════════ */
AIT.Modal = (function(){
  function show(opts){
    /* opts: { title, body (html string or element), footer (html), onConfirm, confirmLabel, cancelLabel } */
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal-box">' +
        '<div class="modal-header">' +
          '<h3>' + (opts.title||'') + '</h3>' +
          '<button class="modal-close btn-icon">&#x2715;</button>' +
        '</div>' +
        '<div class="modal-body"></div>' +
        '<div class="modal-footer">' +
          (opts.footer || (
            '<button class="btn btn--ghost modal-cancel">' + (opts.cancelLabel||'Cancel') + '</button>' +
            (opts.onConfirm ? '<button class="btn btn--primary modal-confirm">' + (opts.confirmLabel||'Confirm') + '</button>' : '')
          )) +
        '</div>' +
      '</div>';
    var body = AIT.Utils.qs('.modal-body', overlay);
    if(typeof opts.body === 'string') body.innerHTML = opts.body;
    else if(opts.body) body.appendChild(opts.body);

    AIT.Utils.qs('.modal-close', overlay).onclick = function(){ close(overlay); };
    var cancelBtn = AIT.Utils.qs('.modal-cancel', overlay);
    if(cancelBtn) cancelBtn.onclick = function(){ close(overlay); };
    var confirmBtn = AIT.Utils.qs('.modal-confirm', overlay);
    if(confirmBtn && opts.onConfirm) confirmBtn.onclick = function(){ opts.onConfirm(overlay); };
    overlay.onclick = function(e){ if(e.target === overlay) close(overlay); };
    document.body.appendChild(overlay);
    setTimeout(function(){ overlay.classList.add('show'); }, 10);
    return overlay;
  }
  function close(overlay){ overlay.classList.remove('show'); setTimeout(function(){ overlay && overlay.remove(); }, 250); }
  return { show, close };
})();


/* ═══════════════════════════════════════════════════════════════
   AIT — router.js
   ═══════════════════════════════════════════════════════════════ */
AIT.Router = (function(){
  var currentView = null;

  function go(session){
    var app = document.getElementById('app');
    app.innerHTML = '';
    app.className = '';

    if(!session){
      app.className = 'view-login';
      AIT.Views.Login.render(app);
      return;
    }
    if(session.role === 'coe'){
      app.className = 'view-dashboard';
      AIT.Views.COE.render(app);
    } else if(session.role === 'admin'){
      app.className = 'view-dashboard';
      AIT.Views.Admin.render(app);
    } else if(session.role === 'evaluator'){
      app.className = 'view-evaluator';
      AIT.Views.Evaluator.render(app, session);
    }
  }

  function init(){
    AIT.DB.seed();
    var session = AIT.Auth.current();
    go(session);
  }

  function navigate(to, params){
    if(to === 'logout'){
      AIT.Auth.logout();
      go(null);
    } else if(to === 'report'){
      AIT.Views.Report.render(document.getElementById('main-content'), params);
    } else if(to === 'coe'){
      go(AIT.Auth.current());
    }
  }

  return { init, go, navigate };
})();

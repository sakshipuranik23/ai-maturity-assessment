/* ═══════════════════════════════════════════════════════════════
   AIT — views/login.js
   ═══════════════════════════════════════════════════════════════ */
AIT.Views = AIT.Views || {};

AIT.Views.Login = {
  render: function(container){
    container.innerHTML =
      '<div class="login-split">' +
        '<div class="login-brand">' +
          '<div class="login-brand__inner">' +
            '<div class="login-logo"><span class="logo-icon">◈</span><span class="logo-text">AI Maturity Tool</span></div>' +
            '<h1 class="login-headline">Enterprise AI<br>Maturity Assessment</h1>' +
            '<p class="login-sub">A structured framework for evaluating organisational AI adoption across six critical dimensions — people, process, technology, data, culture, and governance.</p>' +
            '<div class="login-stats">' +
              '<div class="stat"><span class="stat-num">6</span><span class="stat-label">Dimensions</span></div>' +
              '<div class="stat"><span class="stat-num">37</span><span class="stat-label">Sub-dimensions</span></div>' +
              '<div class="stat"><span class="stat-num">3</span><span class="stat-label">Evaluators</span></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="login-panel">' +
          '<div class="login-form-wrap">' +
            '<div class="login-tabs">' +
              '<button class="login-tab active" data-tab="staff">COE / Admin</button>' +
              '<button class="login-tab" data-tab="evaluator">Evaluator</button>' +
            '</div>' +
            '<div class="login-tab-content" id="tab-staff">' +
              '<p class="login-hint">Sign in with your COE or Admin credentials.</p>' +
              '<div class="form-group"><label>Email Address</label><input type="email" id="login-email" placeholder="you@coe.com" autocomplete="email"></div>' +
              '<div class="form-group"><label>Password</label><input type="password" id="login-pass" placeholder="••••••••"></div>' +
              '<div class="login-error" id="staff-error"></div>' +
              '<button class="btn btn--primary btn--full" id="btn-staff-login">Sign In</button>' +
              '<div class="login-demo-hint"><strong>Demo accounts:</strong><br>alice@coe.com / coe123 &nbsp;|&nbsp; bob@coe.com / coe123 &nbsp;|&nbsp; admin@ait.com / admin123</div>' +
            '</div>' +
            '<div class="login-tab-content hidden" id="tab-evaluator">' +
              '<p class="login-hint">Enter the access code provided by your COE coordinator.</p>' +
              '<div class="form-group"><label>Access Code</label><input type="text" id="login-code" placeholder="e.g. 101001" maxlength="10" style="letter-spacing:4px;font-size:1.4rem;text-align:center;"></div>' +
              '<div class="login-error" id="eval-error"></div>' +
              '<button class="btn btn--primary btn--full" id="btn-eval-login">Access Assessment</button>' +
              '<div class="login-demo-hint"><strong>Demo codes:</strong><br>' +
                '101001–101003 (TechCorp — completed)&nbsp;&nbsp;' +
                '102001–102002 (NovaPay — submitted)&nbsp;&nbsp;' +
                '102003 (NovaPay E3 — pending)&nbsp;&nbsp;' +
                '103001–103003 (GlobalBank — pending)' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    /* Tab switching */
    container.querySelectorAll('.login-tab').forEach(function(tab){
      tab.addEventListener('click', function(){
        container.querySelectorAll('.login-tab').forEach(function(t){ t.classList.remove('active'); });
        container.querySelectorAll('.login-tab-content').forEach(function(c){ c.classList.add('hidden'); });
        tab.classList.add('active');
        container.querySelector('#tab-' + tab.dataset.tab).classList.remove('hidden');
      });
    });

    /* Staff login */
    function doStaffLogin(){
      var email = document.getElementById('login-email').value.trim();
      var pass  = document.getElementById('login-pass').value;
      var errEl = document.getElementById('staff-error');
      errEl.textContent = '';
      var res = AIT.Auth.login(email, pass);
      if(!res.ok){ errEl.textContent = res.error; return; }
      AIT.Router.go(AIT.Auth.current());
    }
    document.getElementById('btn-staff-login').addEventListener('click', doStaffLogin);
    document.getElementById('login-pass').addEventListener('keydown', function(e){ if(e.key==='Enter') doStaffLogin(); });

    /* Evaluator login */
    function doEvalLogin(){
      var code  = document.getElementById('login-code').value.trim();
      var errEl = document.getElementById('eval-error');
      errEl.textContent = '';
      var res = AIT.Auth.loginCode(code);
      if(!res.ok){ errEl.textContent = res.error; return; }
      AIT.Router.go(AIT.Auth.current());
    }
    document.getElementById('btn-eval-login').addEventListener('click', doEvalLogin);
    document.getElementById('login-code').addEventListener('keydown', function(e){ if(e.key==='Enter') doEvalLogin(); });
  }
};

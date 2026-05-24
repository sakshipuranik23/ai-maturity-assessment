/* ═══════════════════════════════════════════════════════════════
   AIT — db.js  |  localStorage CRUD + seed data
   ═══════════════════════════════════════════════════════════════ */

AIT.DB = (function(){

  var PREFIX = 'ait_';

  function key(k){ return PREFIX + k; }

  function get(k){
    try { return JSON.parse(localStorage.getItem(key(k))); } catch(e){ return null; }
  }
  function set(k, v){
    localStorage.setItem(key(k), JSON.stringify(v));
  }
  function getList(k){ return get(k) || []; }
  function setList(k, arr){ set(k, arr); }

  /* ─── GENERIC CRUD ─── */
  function findById(k, id){
    return getList(k).find(function(r){ return r.id === id; }) || null;
  }
  function insert(k, record){
    var list = getList(k);
    list.push(record);
    setList(k, list);
    return record;
  }
  function update(k, id, patch){
    var list = getList(k);
    var idx  = list.findIndex(function(r){ return r.id === id; });
    if(idx < 0) return null;
    list[idx] = Object.assign({}, list[idx], patch);
    setList(k, list);
    return list[idx];
  }
  function remove(k, id){
    var list = getList(k).filter(function(r){ return r.id !== id; });
    setList(k, list);
  }

  /* ─── CLIENTS ─── */
  var Clients = {
    all:   function(){ return getList('clients'); },
    byId:  function(id){ return findById('clients', id); },
    byCoe: function(coeId){ return getList('clients').filter(function(c){ return c.coeId === coeId; }); },
    create:function(data){ return insert('clients', data); },
    update:function(id, patch){ return update('clients', id, patch); },
  };

  /* ─── ASSESSMENTS ─── */
  var Assessments = {
    all:         function(){ return getList('assessments'); },
    byId:        function(id){ return findById('assessments', id); },
    byClient:    function(clientId){ return getList('assessments').find(function(a){ return a.clientId === clientId; }) || null; },
    create:      function(data){ return insert('assessments', data); },
    update:      function(id, patch){ return update('assessments', id, patch); },
  };

  /* ─── EVALUATOR SLOTS ─── */
  var Slots = {
    all:            function(){ return getList('slots'); },
    byId:           function(id){ return findById('slots', id); },
    byAssessment:   function(asmtId){ return getList('slots').filter(function(s){ return s.assessmentId === asmtId; }); },
    byCode:         function(code){ return getList('slots').find(function(s){ return s.loginCode === code; }) || null; },
    create:         function(data){ return insert('slots', data); },
    update:         function(id, patch){ return update('slots', id, patch); },
    saveScore:      function(slotId, subDimId, score, comments){
      var list = getList('slots');
      var idx  = list.findIndex(function(s){ return s.id === slotId; });
      if(idx < 0) return;
      if(!list[idx].scores) list[idx].scores = {};
      list[idx].scores[subDimId] = { score: score, comments: comments || '' };
      setList('slots', list);
    }
  };

  /* ─── OVERRIDE REQUESTS ─── */
  var Overrides = {
    all:           function(){ return getList('overrides'); },
    byId:          function(id){ return findById('overrides', id); },
    pending:       function(){ return getList('overrides').filter(function(o){ return o.status === 'pending'; }); },
    byAssessment:  function(asmtId){ return getList('overrides').filter(function(o){ return o.assessmentId === asmtId; }); },
    create:        function(data){ return insert('overrides', data); },
    update:        function(id, patch){ return update('overrides', id, patch); },
  };

  /* ─── AUTH SESSION ─── */
  var Session = {
    get:    function(){ return get('session'); },
    set:    function(s){ set('session', s); },
    clear:  function(){ localStorage.removeItem(key('session')); }
  };

  /* ─── SEED ─── */
  function isSeeded(){ return !!get('seeded'); }

  function generateScores(profile){
    /* profile: array of 37 numbers corresponding to sub-dim order */
    var scores = {};
    var idx = 0;
    AIT.DIMENSIONS.forEach(function(d){
      d.subDimensions.forEach(function(sd){
        var s = profile[idx] || 3;
        scores[sd.id] = { score: s, comments: '' };
        idx++;
      });
    });
    return scores;
  }

  /* Seed score profiles — 37 values each (one per sub-dim in dimension order D1→D6) */
  /* TechCorp Financial — completed */
  var TC_E1 = [4,3,3,3,4,3,  3,4,3,3,3,4,3,  4,3,4,3,3,4,3,  3,3,3,3,4,3,  4,4,5,3,3,  4,3,3,3,3,3];
  var TC_E2 = [3,3,3,2,2,3,  3,4,3,3,2,3,2,  4,3,3,3,2,3,3,  3,3,2,2,3,3,  3,3,3,3,3,  3,3,3,3,3,3];
  var TC_E3 = [2,2,3,2,2,3,  3,3,2,3,2,3,2,  3,2,3,2,2,3,3,  3,2,1,2,3,2,  2,3,3,2,3,  3,3,3,3,3,3];

  /* NovaPay Solutions — E1 + E2 submitted, E3 pending */
  var NP_E1 = [3,3,2,2,3,2,  2,3,2,2,2,3,2,  3,2,3,2,2,3,2,  2,2,2,2,3,2,  3,3,4,2,2,  3,3,2,2,2,2];
  var NP_E2 = [2,2,2,1,2,2,  2,2,2,2,1,2,1,  3,2,2,2,1,2,2,  2,2,1,1,2,2,  2,2,3,2,2,  2,2,2,2,2,2];

  function seed(){
    if(isSeeded()) return;

    /* ─ Clients ─ */
    Clients.create({ id:'c1', name:'TechCorp Financial Ltd',   type:'Public',   sector:'FinTech',          productsServices:'Digital lending platform, payments infrastructure', size:'XL (1000–5000)',  coeId:'u1', status:'completed', createdAt:'2025-10-01', poc:{ name:'Rohan Mehta', phone:'+91 98201 11111', email:'rohan.mehta@techcorp.com', designation:'Chief Digital Officer' }, nominees:{ evaluator1:[{name:'Sanjay Gupta',title:'CTO',email:'sanjay@techcorp.com',phone:'+91 98201 22222',vertical:'Technology'},{name:'Priya Nair',title:'CEO',email:'priya@techcorp.com',phone:'+91 98201 22223',vertical:'Leadership'},{name:'Amit Shah',title:'COO',email:'amit@techcorp.com',phone:'+91 98201 22224',vertical:'Operations'}], evaluator2:[{name:'Vikram Singh',title:'VP Engineering',email:'vikram@techcorp.com',phone:'+91 98201 33333',vertical:'Engineering',reportsToE1:false},{name:'Nisha Patel',title:'Head of Product',email:'nisha@techcorp.com',phone:'+91 98201 33334',vertical:'Product',reportsToE1:false},{name:'Raj Kumar',title:'Engineering Manager',email:'raj@techcorp.com',phone:'+91 98201 33335',vertical:'Engineering',reportsToE1:false}], evaluator3:[{name:'Dr. Meena Krishnan',title:'Independent AI Consultant',email:'meena@aiconsult.in',phone:'+91 98201 44444',vertical:'External',declarationSigned:true},{name:'Arun Bose',title:'BFSI Technology Advisor',email:'arun@bfsitech.in',phone:'+91 98201 44445',vertical:'External',declarationSigned:true},{name:'Sara Thomas',title:'Digital Transformation Lead',email:'sara@dtpartners.in',phone:'+91 98201 44446',vertical:'External',declarationSigned:true}] }, requestCOEAsE3:false });

    Clients.create({ id:'c2', name:'NovaPay Solutions Pvt Ltd', type:'Private', sector:'Payments',          productsServices:'UPI infrastructure, merchant payment gateway', size:'Medium (50–250)', coeId:'u1', status:'active',    createdAt:'2025-11-10', poc:{ name:'Ananya Roy', phone:'+91 98201 55555', email:'ananya.roy@novapay.io', designation:'Head of Technology' }, nominees:{ evaluator1:[{name:'Sameer Joshi',title:'Founder & CEO',email:'sameer@novapay.io',phone:'+91 98201 66666',vertical:'Leadership'},{name:'Divya Kapoor',title:'MD',email:'divya@novapay.io',phone:'+91 98201 66667',vertical:'Leadership'},{name:'Kiran Rao',title:'COO',email:'kiran@novapay.io',phone:'+91 98201 66668',vertical:'Operations'}], evaluator2:[{name:'Rohit Desai',title:'Lead Engineer',email:'rohit@novapay.io',phone:'+91 98201 77777',vertical:'Engineering',reportsToE1:false},{name:'Tanya Verma',title:'Product Manager',email:'tanya@novapay.io',phone:'+91 98201 77778',vertical:'Product',reportsToE1:false},{name:'Aditya Bhat',title:'DevOps Lead',email:'aditya@novapay.io',phone:'+91 98201 77779',vertical:'Engineering',reportsToE1:false}], evaluator3:[{name:'Farhan Sheikh',title:'AI Risk Advisor',email:'farhan@riskadvisors.co',phone:'+91 98201 88888',vertical:'External',declarationSigned:true},{name:'Pallavi Iyer',title:'FinTech Consultant',email:'pallavi@fintechco.in',phone:'+91 98201 88889',vertical:'External',declarationSigned:true},{name:'Nikhil Choudhary',title:'Digital Banking Expert',email:'nikhil@dbexperts.in',phone:'+91 98201 88890',vertical:'External',declarationSigned:true}] }, requestCOEAsE3:false });

    Clients.create({ id:'c3', name:'GlobalBank Ltd',           type:'Public',   sector:'Banking',           productsServices:'Retail banking, corporate lending, trade finance', size:'MNC (5000+)',    coeId:'u2', status:'active',    createdAt:'2025-12-01', poc:{ name:'Suresh Kumar', phone:'+91 98201 99999', email:'suresh.kumar@globalbank.com', designation:'Group CISO' }, nominees:{ evaluator1:[{name:'Anand Pillai',title:'Group CTO',email:'anand@globalbank.com',phone:'+91 98201 10001',vertical:'Technology'},{name:'Rupa Sen',title:'Group CDO',email:'rupa@globalbank.com',phone:'+91 98201 10002',vertical:'Digital'},{name:'Venu Gopal',title:'Group COO',email:'venu@globalbank.com',phone:'+91 98201 10003',vertical:'Operations'}], evaluator2:[{name:'Manoj Tiwari',title:'Head of Engineering',email:'manoj@globalbank.com',phone:'+91 98201 10004',vertical:'Engineering',reportsToE1:false},{name:'Leena Shah',title:'Principal Architect',email:'leena@globalbank.com',phone:'+91 98201 10005',vertical:'Architecture',reportsToE1:false},{name:'Dev Sharma',title:'Delivery Manager',email:'dev@globalbank.com',phone:'+91 98201 10006',vertical:'Delivery',reportsToE1:false}], evaluator3:[{name:'External Evaluator A',title:'AI Governance Specialist',email:'eval.a@coeexternal.com',phone:'+91 98201 10007',vertical:'External',declarationSigned:true},{name:'External Evaluator B',title:'FS Technology Advisor',email:'eval.b@coeexternal.com',phone:'+91 98201 10008',vertical:'External',declarationSigned:true},{name:'External Evaluator C',title:'RegTech Consultant',email:'eval.c@coeexternal.com',phone:'+91 98201 10009',vertical:'External',declarationSigned:true}] }, requestCOEAsE3:false });

    /* ─ Assessments ─ */
    Assessments.create({ id:'a1', clientId:'c1', status:'completed', createdAt:'2025-10-05', deadline:null, reportGenerated:true, reportGeneratedAt:'2025-10-20', reconciledScores:{ d1_leadership:3, d1_change:2, d5_psych_safety:3, d5_exec_sponsorship:4, d4_mlops:2 } });
    Assessments.create({ id:'a2', clientId:'c2', status:'in_progress', createdAt:'2025-11-15', deadline:'2025-12-15', reportGenerated:false, reportGeneratedAt:null, reconciledScores:{} });
    Assessments.create({ id:'a3', clientId:'c3', status:'in_progress', createdAt:'2025-12-05', deadline:null, reportGenerated:false, reportGeneratedAt:null, reconciledScores:{} });

    /* ─ Slots ─ */
    /* TechCorp c1/a1 — all submitted */
    Slots.create({ id:'s1', assessmentId:'a1', clientId:'c1', slotNumber:1, role:'leadership',   selectedNominee:{ name:'Sanjay Gupta', designation:'CTO', email:'sanjay@techcorp.com' }, loginCode:'101001', status:'submitted', scores:generateScores(TC_E1), submittedAt:'2025-10-12T09:30:00Z', overriddenScores:{} });
    Slots.create({ id:'s2', assessmentId:'a1', clientId:'c1', slotNumber:2, role:'tech_lead',    selectedNominee:{ name:'Vikram Singh', designation:'VP Engineering', email:'vikram@techcorp.com' }, loginCode:'101002', status:'submitted', scores:generateScores(TC_E2), submittedAt:'2025-10-13T14:15:00Z', overriddenScores:{} });
    Slots.create({ id:'s3', assessmentId:'a1', clientId:'c1', slotNumber:3, role:'independent',  selectedNominee:{ name:'Dr. Meena Krishnan', designation:'Independent AI Consultant', email:'meena@aiconsult.in' }, loginCode:'101003', status:'submitted', scores:generateScores(TC_E3), submittedAt:'2025-10-15T16:45:00Z', overriddenScores:{} });

    /* NovaPay c2/a2 — E1 + E2 submitted, E3 pending */
    Slots.create({ id:'s4', assessmentId:'a2', clientId:'c2', slotNumber:1, role:'leadership',   selectedNominee:{ name:'Sameer Joshi', designation:'Founder & CEO', email:'sameer@novapay.io' }, loginCode:'102001', status:'submitted', scores:generateScores(NP_E1), submittedAt:'2025-11-20T10:00:00Z', overriddenScores:{} });
    Slots.create({ id:'s5', assessmentId:'a2', clientId:'c2', slotNumber:2, role:'tech_lead',    selectedNominee:{ name:'Rohit Desai', designation:'Lead Engineer', email:'rohit@novapay.io' }, loginCode:'102002', status:'submitted', scores:generateScores(NP_E2), submittedAt:'2025-11-22T11:30:00Z', overriddenScores:{} });
    Slots.create({ id:'s6', assessmentId:'a2', clientId:'c2', slotNumber:3, role:'independent',  selectedNominee:{ name:'Farhan Sheikh', designation:'AI Risk Advisor', email:'farhan@riskadvisors.co' }, loginCode:'102003', status:'pending',   scores:{}, submittedAt:null, overriddenScores:{} });

    /* GlobalBank c3/a3 — none submitted */
    Slots.create({ id:'s7', assessmentId:'a3', clientId:'c3', slotNumber:1, role:'leadership',   selectedNominee:{ name:'Anand Pillai', designation:'Group CTO', email:'anand@globalbank.com' }, loginCode:'103001', status:'pending', scores:{}, submittedAt:null, overriddenScores:{} });
    Slots.create({ id:'s8', assessmentId:'a3', clientId:'c3', slotNumber:2, role:'tech_lead',    selectedNominee:{ name:'Manoj Tiwari', designation:'Head of Engineering', email:'manoj@globalbank.com' }, loginCode:'103002', status:'pending', scores:{}, submittedAt:null, overriddenScores:{} });
    Slots.create({ id:'s9', assessmentId:'a3', clientId:'c3', slotNumber:3, role:'independent',  selectedNominee:{ name:'External Evaluator A', designation:'AI Governance Specialist', email:'eval.a@coeexternal.com' }, loginCode:'103003', status:'pending', scores:{}, submittedAt:null, overriddenScores:{} });

    /* ─ Override requests ─ */
    Overrides.create({ id:'ov1', clientId:'c1', assessmentId:'a1', slotId:'s1', slotNumber:1, subDimId:'d1_leadership', originalScore:4, requestedScore:3, reasoning:'Upon reviewing interview evidence from the independent evaluator, the leadership score appears inflated. The leader could not name a specific AI-informed decision from Q4.', requestedBy:'u1', requestedByName:'Alice Chen', requestedAt:'2025-10-21T09:00:00Z', status:'approved', adminNote:'Approved. Evidence from independent evaluator supports downgrade. Score updated.', reviewedAt:'2025-10-21T14:00:00Z', reviewedBy:'u3' });
    Overrides.create({ id:'ov2', clientId:'c1', assessmentId:'a1', slotId:'s1', slotNumber:1, subDimId:'d5_exec_sponsorship', originalScore:5, requestedScore:4, reasoning:'Leadership self-reported a score of 5 but independent evaluator interviews suggest the executive sponsor has not personally reviewed AI performance data in the last two quarters.', requestedBy:'u1', requestedByName:'Alice Chen', requestedAt:'2025-10-21T09:15:00Z', status:'pending', adminNote:'', reviewedAt:null, reviewedBy:null });

    set('seeded', true);
  }

  return {
    Clients, Assessments, Slots, Overrides, Session,
    seed,
    isSeeded,
    generateId: function(prefix){ return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,7); }
  };

})();

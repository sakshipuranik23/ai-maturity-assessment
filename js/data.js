/* ═══════════════════════════════════════════════════════════════
   AIT — data.js  |  Framework data, users, seed records
   ═══════════════════════════════════════════════════════════════ */

var AIT = window.AIT || {};

/* ─── HARDCODED USERS ─── */
AIT.USERS = [
  { id:'u1', name:'Alice Chen',         email:'alice@coe.com',  password:'coe123',   role:'coe'   },
  { id:'u2', name:'Bob Patel',          email:'bob@coe.com',    password:'coe123',   role:'coe'   },
  { id:'u3', name:'System Admin',       email:'admin@ait.com',  password:'admin123', role:'admin' }
];

/* ─── ASSESSMENT FRAMEWORK ─── */
/* levelType: 'full' = L1-L5 defined | 'alt' = L1/L3/L5 defined, L2/L4 interpolated */
/* D6 dimensions are 'full' and have the blocking rule */

AIT.DIMENSIONS = [
  {
    id:'d1', code:'D1', name:'People & Organisation',
    description:'Assesses whether the human infrastructure for AI adoption is in place — the skills, the structures, the talent pipelines, and the readiness for change. Most prone to scoring inflation.',
    color:'#6366f1',
    subDimensions:[
      {
        id:'d1_leadership', name:'Leadership AI Literacy',
        description:'The degree to which leadership understands AI adoption deeply enough to make informed decisions — not just to endorse it.',
        levelType:'alt',
        anchors:{
          1:'Leadership is aware of AI tools but has not made specific AI-informed decisions. AI adoption is delegated entirely to the technology function.',
          3:'Leadership has approved AI tool adoption and allocated a budget. Can articulate the difference between AI-assisted and AI-executed work. Has reviewed at least one AI adoption progress report in the last quarter.',
          5:'Leadership actively participates in AI governance decisions, can name specific AI-generated outputs that have entered production, and has adjusted strategy based on AI performance data.'
        },
        evaluatorNote:'Ask the leader to describe a specific AI adoption decision made in the last quarter — what was decided, what data informed it, who was involved. Enthusiasm for AI without specific decisions indicates scoring of intention rather than practice.'
      },
      {
        id:'d1_team_skills', name:'Team Skills (AI Tooling Adoption Depth)',
        description:'How deeply AI tools are embedded in the delivery team\'s day-to-day work, beyond surface-level experimentation.',
        levelType:'alt',
        anchors:{
          1:'Some team members use AI tools individually. No shared standards or practices exist.',
          3:'AI tools are formally adopted across the team. Usage is tracked. A prompt library or equivalent exists.',
          5:'The team has measurable AI performance data (attempt counts, first-pass acceptance rates). AI tool usage is embedded in ceremonies and retrospectives.'
        },
        evaluatorNote:'Ask to see the prompt library. Ask a developer to demonstrate how they use AI in a typical story. If neither exists in a concrete form, score is at most Level 2 regardless of reported adoption rates.'
      },
      {
        id:'d1_org_design', name:'Organisational Design Enabling AI-First Delivery',
        description:'Whether the team\'s structure supports AI-augmented delivery — roles, reporting lines, and decision rights.',
        levelType:'alt',
        anchors:{
          1:'Standard team structure with no AI-specific roles. AI is treated as a tool, not a delivery model change.',
          3:'A named AI governance owner exists. At least one role has explicit AI oversight responsibility (e.g. prompt library owner, checkpoint accountability).',
          5:'Team structure includes the Requirements Analyst sub-role or equivalent. AI governance responsibilities are formally documented. The Centre of Excellence or equivalent exists.'
        },
        evaluatorNote:'Ask who is accountable when AI-generated output causes a production incident. A vague answer ("the team") indicates organisational design has not caught up with AI adoption.'
      },
      {
        id:'d1_talent', name:'Talent Pipelines & Reskilling',
        description:'Whether the organisation is actively building the skills future AI adoption requires, not just the skills current practice demands.',
        levelType:'alt',
        anchors:{
          1:'No structured reskilling programme. Training is ad hoc and individually driven.',
          3:'A learning programme for AI tools exists. At least one of the three learning tracks (personal growth, future preparedness, immediate project requirement) is formally supported.',
          5:'All three learning tracks are active. Track 2 (future preparedness) specifically addresses the next maturity level transition. Course recommendations are current and reviewed quarterly.'
        },
        evaluatorNote:'Ask to see evidence of Track 2 learning activity. Practitioners who are developing skills for a maturity level above their current one are the leading indicator of successful future transitions.'
      },
      {
        id:'d1_change', name:'Change Readiness',
        description:'Whether practitioners are psychologically and practically prepared for the role identity changes AI adoption requires.',
        levelType:'alt',
        anchors:{
          1:'No structured change management. Resistance is managed reactively.',
          3:'Change management is acknowledged. At least one retrospective per quarter includes a discussion of how practitioners are experiencing the transition.',
          5:'Resistance is proactively managed. Practitioners can articulate the shift in their role\'s value proposition. Early wins (catching AI failure modes, developing prompt fluency) are visible and rewarded.'
        },
        evaluatorNote:'Ask practitioners, not leadership, whether they feel their role is more or less valued since AI adoption began. The gap between leadership\'s perception and practitioners\' experience is the most reliable indicator of change readiness.'
      },
      {
        id:'d1_hiring', name:'Hiring Strategy',
        description:'Whether the organisation\'s hiring process has been updated to select for the skills AI-augmented delivery requires.',
        levelType:'alt',
        anchors:{
          1:'Standard technical interview process. No AI-specific assessment elements.',
          3:'At least one AI-specific assessment (prompt engineering exercise, AI output review task) has been added to the hiring process for technical roles.',
          5:'The full redesigned hiring assessment is in use. Domain knowledge depth is assessed alongside technical capability. AI scepticism calibration is explicitly evaluated.'
        },
        evaluatorNote:'Ask to see the job descriptions and interview rubric for a recent technical hire. If "prompt engineering" or "AI output validation" does not appear, the hiring strategy has not been updated.'
      }
    ]
  },
  {
    id:'d2', code:'D2', name:'Process & Delivery',
    description:'Assesses the maturity of the team\'s delivery workflow and how deeply AI has been integrated into it. Most direct connection to operational prescriptions.',
    color:'#0ea5e9',
    subDimensions:[
      {
        id:'d2_requirements', name:'Requirements Engineering',
        description:'The rigour and precision of the requirements process — from stakeholder input to sprint-ready story.',
        levelType:'full',
        anchors:{
          1:'Requirements are gathered informally. User stories are written by developers or POs without a structured process. Acceptance criteria are vague or absent.',
          2:'A requirements process exists. User stories follow a consistent format. Acceptance criteria are written but not systematically reviewed for precision.',
          3:'AI assists in first-draft story and BRD generation. A Requirements Analyst role or equivalent exists. Acceptance criteria are reviewed against a standard but not yet binary-testable.',
          4:'Every AI-executable story has human-written acceptance criteria meeting the binary pass/fail standard. Data completeness is confirmed before sprint entry. Story categorisation (human/AI-assisted/AI-executed) is performed in Sprint 0.',
          5:'Requirements Analyst role is embedded and measurably effective. First-pass DOR rate is tracked and above 80% for two or more consecutive sprints. Specification defect rate is declining sprint over sprint.'
        },
        evaluatorNote:'Ask to see three acceptance criteria from the current backlog. Apply the binary test standard: can each criterion be expressed as a specific pass condition and a specific fail condition without interpretation? If not, requirements engineering is below Level 3 regardless of reported process maturity.'
      },
      {
        id:'d2_cicd', name:'CI/CD Maturity',
        description:'The automation and reliability of the build, test, and deployment pipeline.',
        levelType:'full',
        anchors:{
          1:'Manual build and deployment processes. No automated testing in the pipeline.',
          2:'Basic CI pipeline exists. Automated unit tests run on commit. Deployment is partially manual.',
          3:'Full CI/CD pipeline with automated testing, code quality gates, and automated deployment to non-production environments. Pipeline success rate above 90%.',
          4:'AI-generated code is automatically integrated into the CI/CD pipeline. AI-generated tests run alongside human-authored adversarial tests. Security scanning is automated in the pipeline.',
          5:'Pipeline includes AI execution cycle integration — overnight agent runs are incorporated into the pipeline, not separate from it. Prompt log entries are automatically generated at pipeline execution points. Pipeline metrics feed the AI status brief.'
        },
        evaluatorNote:'Ask to see the last ten pipeline runs. What percentage succeeded? What failed? If the team cannot produce this data quickly, CI/CD maturity is below Level 3.'
      },
      {
        id:'d2_quality', name:'Quality Engineering',
        description:'The sophistication of the team\'s approach to ensuring output quality — beyond standard testing.',
        levelType:'full',
        anchors:{
          1:'Manual testing only. Test coverage is not measured. Defects are found in production.',
          2:'Automated unit and integration tests exist. Test coverage is measured but not enforced. QA is a separate function from development.',
          3:'Test coverage thresholds are enforced in the pipeline. A QA strategy exists and is reviewed each sprint. AI-generated test suites supplement manual testing.',
          4:'Adversarial test suites are written by humans for AI-executed stories. The circularity risk (AI generating tests for AI-generated code) is explicitly managed. QA Lead has FS-specific regulatory testing knowledge.',
          5:'AI failure mode detection rate is tracked. Hallucination check is a formal DoD step. Post-sprint defect origin rate is attributed to specific DoD failures and used to improve the framework.'
        },
        evaluatorNote:'Ask whether adversarial tests exist for AI-executed stories. Ask who writes them and ask to see one. An adversarial test written by AI for AI-generated code is not an adversarial test — it is a circularity validator.'
      },
      {
        id:'d2_release', name:'Release Management',
        description:'The control and governance of what enters production, including AI-generated output.',
        levelType:'full',
        anchors:{
          1:'Ad hoc releases. No formal change management process. No distinction between AI-generated and human-generated releases.',
          2:'A release process exists. Change requests are submitted. Release windows are defined.',
          3:'AI-generated output is explicitly tracked in release records. A named human approver is recorded for AI-generated changes. Release notes distinguish AI-executed from human-executed changes.',
          4:'Prompt log references are included in change records. Release management accounts for the gap between AI execution completion and change advisory board approval. Stakeholders understand this gap.',
          5:'Release metrics differentiate AI-executed from human-executed changes. Time from AI execution to production deployment is tracked and used to set sprint commitments accurately.'
        },
        evaluatorNote:'Ask to see a recent change record for an AI-generated release. Does it include a named human approver? Does it reference the prompt log? If neither exists, release management has not caught up with AI adoption.'
      },
      {
        id:'d2_incident', name:'Incident & MTTR',
        description:'The team\'s ability to detect, respond to, and resolve incidents — including incidents caused by AI-generated output.',
        levelType:'full',
        anchors:{
          1:'Incidents are resolved reactively. MTTR is not measured. No post-incident process.',
          2:'Incidents are tracked. MTTR is measured. Post-incident reviews occur for major incidents.',
          3:'AI-specific incident types are defined (hallucination in production, model version mismatch, prompt log gap). Incidents are categorised by whether AI-generated output was involved.',
          4:'AI-generated production incidents are traceable to the prompt log — the generator, the approver, the model version, and the prompt are all retrievable within one hour of incident declaration.',
          5:'AI incident response playbook exists. MTTR for AI-specific incidents is tracked separately and declining. Post-incident retrospectives feed framework improvements.'
        },
        evaluatorNote:'Ask: if an AI-generated feature caused a production incident today, how long would it take to retrieve the prompt that generated it, the model version used, and the name of the person who approved it? If more than one hour, audit trail maturity is below Level 4.'
      },
      {
        id:'d2_sprint', name:'Sprint Health',
        description:'The overall quality and predictability of the sprint cycle — ceremonies, commitments, and retrospective discipline.',
        levelType:'full',
        anchors:{
          1:'Sprints exist in name only. Planning is informal, standups are status reports, retrospectives are skipped.',
          2:'All ceremonies run but inconsistently. Sprint goals are set but not consistently met. Retrospectives produce observations but not tracked commitments.',
          3:'All five ceremonies run consistently. Sprint goal met rate is above 60%. Retrospective commitments are followed up. Velocity baseline exists.',
          4:'Sprint goal met rate is above 75%. Retrospective commitment follow-through rate is above 80%. AI-specific metrics (first-pass acceptance rate, checkpoint queue clearance) are tracked and discussed in ceremonies.',
          5:'Sprint goal met rate is above 80% for six or more consecutive sprints. AI maturity decisions are made at retrospectives. The standup functions as a decision session, not a status report. Prompt library improves every sprint.'
        },
        evaluatorNote:'Attend a standup and a retrospective if possible. In the standup: does the SM arrive with specific decisions to make, or is the session a round-robin? In the retrospective: can the team name a specific AI failure mode they caught this sprint?'
      },
      {
        id:'d2_documentation', name:'Documentation',
        description:'The completeness, currency, and AI-audit readiness of technical and process documentation.',
        levelType:'full',
        anchors:{
          1:'Documentation is minimal, outdated, or undiscoverable.',
          2:'Core technical documentation exists (API specs, architecture diagrams) but is not consistently updated. No AI-specific documentation standard.',
          3:'Documentation is updated as a DoD step. AI-generated documentation is reviewed by a human before acceptance. Logic maps exist for regulated process implementations.',
          4:'Prompt log references are embedded in technical documentation for AI-executed features. Documentation is structured for RAG retrieval by AI agents.',
          5:'Documentation currency is verified at each DoD. Logic maps for regulated stories are signed off by the Compliance SME and formatted for regulatory submission. Documentation feeds AI context without manual intervention.'
        },
        evaluatorNote:'Ask to retrieve the documentation for the last AI-executed story. Is it current? Does it reference the prompt log? A discrepancy between documentation and intent is a hallucination in the documentation layer.'
      }
    ]
  },
  {
    id:'d3', code:'D3', name:'Technology & Tooling',
    description:'Assesses whether the infrastructure required for AI-augmented delivery is in place. Most objectively verifiable dimensions — either the tool exists and is in use, or it does not.',
    color:'#10b981',
    subDimensions:[
      {
        id:'d3_ai_coding', name:'AI Coding Assistant',
        description:'The maturity of AI code generation and completion tool adoption across the delivery team.',
        levelType:'full',
        anchors:{
          1:'No AI coding assistant in use. Code is written entirely manually.',
          2:'Some team members use AI coding assistants individually. No enterprise licence or data agreement. Usage is personal and unsanctioned.',
          3:'Enterprise-licenced AI coding assistant is in use across the team. Data handling agreements are confirmed. Usage is tracked at a basic level.',
          4:'AI coding assistant is integrated into the CI/CD pipeline. Prompt library includes code generation prompts for recurring story types. Attempt counts and token usage are logged per execution.',
          5:'First-pass acceptance rate for AI-generated code is tracked by story type and is above 80% for repeating story types. Model version pinning is enforced. AI coding assistant outputs are distinguishable from human outputs in the codebase.'
        },
        evaluatorNote:'Ask to see a prompt log entry for a recent AI-executed story. If no prompt log exists, the AI coding assistant is being used without governance — score at most Level 2 regardless of which tool is in use.'
      },
      {
        id:'d3_platform', name:'Platform Engineering',
        description:'The maturity of the internal developer platform — the infrastructure that enables teams to build and deploy software efficiently.',
        levelType:'full',
        anchors:{
          1:'No internal platform. Developers manage their own environments and tooling.',
          2:'Basic shared infrastructure exists. Some self-service capability. No AI-specific platform components.',
          3:'Internal developer platform supports AI tool integration. Prompt log repository is deployed and accessible. Sprint execution agent is in development or deployed in pilot.',
          4:'All Category 3 in-house builds are deployed: execution agent, prompt log repository, status brief generator, checkpoint tracking system. Platform supports overnight execution cycles.',
          5:'Platform is self-monitoring — execution failures are automatically flagged, prompt log gaps are detected and alerted, and checkpoint overdue notifications are automated. Platform metrics feed the executive dashboard.'
        },
        evaluatorNote:'Ask to see the prompt log repository. Ask whether the status brief is automatically generated or manually compiled. If the SM is compiling the standup brief manually, platform engineering is below Level 4.'
      },
      {
        id:'d3_infra', name:'Infrastructure Automation',
        description:'The degree to which infrastructure provisioning, scaling, and management is automated.',
        levelType:'full',
        anchors:{
          1:'Manual infrastructure provisioning. No IaC. Environments are inconsistent.',
          2:'Infrastructure as Code exists for some environments. Deployment is partially automated.',
          3:'Full IaC coverage. Environments are consistent and reproducible. AI execution environments can be provisioned automatically.',
          4:'AI agent execution environments are provisioned and de-provisioned automatically per sprint. Overnight execution infrastructure scales based on the story queue.',
          5:'Infrastructure costs for AI execution are tracked per story type and per sprint. Cost-per-sprint metric includes infrastructure component. Scaling is predictive based on sprint plan, not reactive.'
        },
        evaluatorNote:'Ask how long it takes to provision a new AI execution environment. If the answer involves manual steps or more than thirty minutes, infrastructure automation is below Level 4.'
      },
      {
        id:'d3_observability', name:'Observability',
        description:'The team\'s ability to understand what is happening in their systems in real time — including AI agent behaviour.',
        levelType:'full',
        anchors:{
          1:'Basic logging only. No distributed tracing. No alerting.',
          2:'Centralised logging and alerting exist. Basic dashboards are available.',
          3:'Distributed tracing is in place. AI agent execution is logged — start time, completion time, failure flags. Dashboards include AI execution metrics.',
          4:'AI execution observability is integrated with the standup brief generation. Failure patterns are automatically surfaced. AIOps capability identifies anomalies in AI-generated output quality.',
          5:'Observability covers the full AI execution chain — from prompt submission to checkpoint acceptance to production deployment. Regulatory audit queries can be answered from observability data without manual log review.'
        },
        evaluatorNote:'Ask how the team knows when an AI agent fails overnight. If the answer is "we check in the morning," observability is below Level 3. If there is no automated alert, it is Level 2 or below.'
      },
      {
        id:'d3_tech_debt', name:'Tech Debt Posture',
        description:'The team\'s visibility into, prioritisation of, and management of technical debt — including agent debt introduced by uncontrolled AI adoption.',
        levelType:'full',
        anchors:{
          1:'Tech debt is acknowledged but not measured or managed.',
          2:'Tech debt is tracked informally. Some prioritisation occurs but not systematically.',
          3:'Tech debt backlog exists and is reviewed quarterly. Agent debt (fragmented, unversioned AI agents and prompts) is recognised as a category.',
          4:'Agent debt is actively managed — prompt library versioning prevents new agent debt, architectural review in Sprint 0 prevents new integration debt, and the CoE manages cross-team prompt consistency.',
          5:'Agent debt is measured and declining. Tech debt metrics include AI-specific categories. Prompt library retirement process prevents accumulation of underperforming prompts.'
        },
        evaluatorNote:'Ask specifically about agent debt — does the team know how many different prompt variations exist for the same story type across the team? If the answer is unclear, agent debt is accumulating.'
      },
      {
        id:'d3_security', name:'Security',
        description:'The maturity of security practices across the delivery pipeline — including AI-specific security considerations.',
        levelType:'full',
        anchors:{
          1:'Security is reactive. No automated security scanning. Vulnerabilities are found in production.',
          2:'Basic security scanning exists in the pipeline. Vulnerabilities are tracked. No AI-specific security consideration.',
          3:'Security scanning runs automatically on AI-generated code. AI-generated code is not treated as inherently more trusted than human-generated code. No critical or high vulnerabilities in production.',
          4:'AI-generated code is scanned with the same rigour as human-generated code plus a hallucination check for external references. Security scanning results are included in the DoD threshold conditions.',
          5:'AI-specific security threat model exists. Prompt injection risks are documented and mitigated. Security scan results for AI-generated code are tracked separately and trended.'
        },
        evaluatorNote:'Ask whether AI-generated code receives the same security scanning as human-generated code. Ask whether prompt injection is in the threat model. If neither is a yes, security posture has not caught up with AI adoption.'
      },
      {
        id:'d3_llm', name:'LLM / AI Platform',
        description:'The maturity of the AI platform used for agent execution — model access, versioning, governance, and FS compliance.',
        levelType:'full',
        anchors:{
          1:'No formal AI platform. Individual team members use personal AI tool accounts.',
          2:'Enterprise AI tool licence exists with basic data handling agreements. Model version is not pinned or tracked.',
          3:'Enterprise AI platform with confirmed data residency compliance. Model version is recorded in the prompt log. A formal process exists for approving new model versions before they enter the pipeline.',
          4:'Model version pinning is enforced, the same model version is used for the same story type within a sprint. Version changes require SM notification and are logged. Private deployment or on-premise option confirmed for FS data.',
          5:'AI platform governance includes model update impact assessment — when a model version changes, prior executions are reviewed for output quality delta. Platform SLA covers overnight execution uptime requirements.'
        },
        evaluatorNote:'Ask to see evidence that data residency requirements have been confirmed for the AI platform in use. Ask what happens when the platform provider updates the model version — does the team know, and does it matter to their process?'
      }
    ]
  },
  {
    id:'d4', code:'D4', name:'Data & AI Readiness',
    description:'Assesses whether the data infrastructure and governance foundations are in place for reliable AI execution. Assessed at Levels 1, 3, and 5 — intermediate levels can be interpolated.',
    color:'#f59e0b',
    subDimensions:[
      {
        id:'d4_data_quality', name:'Data Quality',
        description:'The reliability, completeness, and consistency of data that AI agents will use as execution context.',
        levelType:'alt',
        anchors:{
          1:'Data quality is not measured. AI agents are given whatever data exists. No confirmation process.',
          3:'Data quality checks exist for primary datasets. The data completeness check in Sprint 0 is performed for AI-executable stories.',
          5:'Data quality is continuously monitored. AI execution failures traceable to data quality issues are tracked. Data quality metrics feed the prompt log.'
        },
        evaluatorNote:'Ask to see the data completeness confirmation for the last Sprint 0. If no documentation exists, data quality governance for AI execution is below Level 3.'
      },
      {
        id:'d4_training', name:'AI Training Data',
        description:'The quality and governance of data used to train or fine-tune AI models used by the team.',
        levelType:'alt',
        anchors:{
          1:'No awareness of training data provenance. Commercial AI tools are used without consideration of what they were trained on.',
          3:'Training data governance is acknowledged. FS-sensitive data is not used in external model training. Data agreements with AI vendors are reviewed.',
          5:'Training data provenance is documented for any fine-tuned models. FS client data is explicitly excluded from any model training pipeline.'
        },
        evaluatorNote:'Ask whether any client data has been used to fine-tune or improve the AI models in use. A vague answer is a governance gap.'
      },
      {
        id:'d4_mlops', name:'MLOps & Governance',
        description:'The operational management of AI models — deployment, monitoring, versioning, and retraining.',
        levelType:'alt',
        anchors:{
          1:'No MLOps practice. Models are used as black boxes with no operational management.',
          3:'Model versioning is tracked. Model performance is monitored at a basic level. A process exists for retiring underperforming models.',
          5:'Full MLOps pipeline exists. Model performance feeds the AI maturity tracking in retrospectives. Model versioning is enforced in the prompt log.'
        },
        evaluatorNote:'Ask how the team knows whether a model update has improved or degraded output quality for their story types. If there is no answer, MLOps maturity is below Level 3.'
      },
      {
        id:'d4_knowledge', name:'Knowledge Management',
        description:'The organisation\'s ability to capture, structure, and retrieve institutional knowledge — particularly for RAG-based AI execution.',
        levelType:'alt',
        anchors:{
          1:'Knowledge is held in individuals\' heads or in disorganised document stores. AI agents cannot access it reliably.',
          3:'A document repository exists and is used. Basic search capability. RAG integration is in development or pilot.',
          5:'The document repository is structured for RAG retrieval. AI agents can retrieve contextual documents for story execution. The prompt library is versioned and accessible.'
        },
        evaluatorNote:'Ask to demonstrate how an AI agent retrieves the API specification for the current engagement. If this requires manual intervention, knowledge management is below Level 4.'
      },
      {
        id:'d4_privacy', name:'Data Privacy',
        description:'The governance of personal and sensitive data throughout the AI-augmented delivery pipeline.',
        levelType:'alt',
        anchors:{
          1:'Data privacy is managed reactively. No specific consideration for AI-generated data outputs.',
          3:'Data privacy policies exist. Client data is not shared with external AI services without approval. Privacy impact assessment exists for AI use cases.',
          5:'Data privacy is a Sprint 0 gate item for stories involving personal data. Privacy impact assessments are updated when AI execution scope changes.'
        },
        evaluatorNote:'Ask whether the data privacy officer has been involved in AI adoption decisions. Ask to see the privacy impact assessment for AI tool use.'
      },
      {
        id:'d4_analytics', name:'Analytics Culture',
        description:'The degree to which the team uses data to make delivery decisions — including DORA metrics and AI performance analytics.',
        levelType:'alt',
        anchors:{
          1:'Delivery decisions are made based on intuition and experience. No structured metrics programme.',
          3:'DORA metrics are tracked. Velocity and defect rate are reviewed regularly. Some AI performance metrics exist.',
          5:'DORA metrics, AI performance metrics, and the five Tier 1 executive metrics are all tracked and discussed in retrospectives. Decisions about AI maturity level transitions are evidence-based.'
        },
        evaluatorNote:'Ask to see the last retrospective\'s data review. Were AI performance metrics (first-pass acceptance rate, attempt count trend, token usage) discussed? If not, analytics culture is below Level 4 for AI adoption purposes.'
      }
    ]
  },
  {
    id:'d5', code:'D5', name:'Culture & Change',
    description:'Most resistant to objective assessment and most prone to scoring inflation. Assessed at Levels 1, 3, and 5. The independent evaluator\'s role is most critical here.',
    color:'#ec4899',
    subDimensions:[
      {
        id:'d5_psych_safety', name:'Psychological Safety',
        description:'Whether practitioners feel safe raising AI failures, admitting uncertainty about AI output, and challenging AI-generated decisions.',
        levelType:'alt',
        anchors:{
          1:'Psychological safety is not discussed. Practitioners who raise AI failures are implicitly or explicitly discouraged.',
          3:'Psychological safety is acknowledged in retrospectives. At least one instance in the last quarter where a practitioner flagged an AI failure without negative consequence.',
          5:'Practitioners routinely flag AI failure modes. The SM creates explicit space for this in standups and retrospectives. Catching an AI failure is visibly rewarded.'
        },
        evaluatorNote:'Ask practitioners privately whether they have ever withheld a concern about AI output because of how it might be received. A yes answer is a Level 1 or 2 signal regardless of how leadership scores this dimension.'
      },
      {
        id:'d5_innovation', name:'Innovation Appetite',
        description:'The organisation\'s tolerance for trying new AI-augmented approaches, including those that initially produce worse outcomes than existing practice.',
        levelType:'alt',
        anchors:{
          1:'Innovation is encouraged in principle but punished when it produces short-term disruption.',
          3:'The velocity dip during AI adoption transition is explicitly accepted by leadership. Pilot programmes are supported with appropriate expectations.',
          5:'Leadership actively creates conditions for Level 3 to Level 4 transition including stakeholder communication about the productivity paradox period.'
        },
        evaluatorNote:'Ask leadership whether they have communicated the velocity transition period to clients or stakeholders. Ask whether anyone has been criticised for AI adoption outcomes that were within expected transition parameters.'
      },
      {
        id:'d5_exec_sponsorship', name:'Executive Sponsorship',
        description:'The degree to which senior leadership actively champions AI adoption — with decisions and resources, not just words.',
        levelType:'alt',
        anchors:{
          1:'AI adoption is approved in principle but not actively sponsored. No named executive owner.',
          3:'A named executive sponsor exists. Budget is allocated. Progress is reviewed quarterly.',
          5:'Executive sponsor participates in CoE governance. Has personally reviewed AI performance data. Has made at least one resource decision based on AI adoption outcomes.'
        },
        evaluatorNote:'Ask who the executive sponsor is. Ask what decision they made last quarter based on AI adoption data. A sponsor who cannot be named or whose last AI-related decision is unclear is a nominal sponsor, not an active one.'
      },
      {
        id:'d5_learning', name:'Learning Culture',
        description:'Whether the organisation treats AI adoption as a continuous learning exercise rather than a one-time implementation.',
        levelType:'alt',
        anchors:{
          1:'Learning is individual and ad hoc. No structured programme. Retrospective learning is not captured or shared.',
          3:'All three learning tracks are active. Retrospective learnings are documented. Cross-team sharing happens at least quarterly.',
          5:'Track 2 (future preparedness) learning is measurably reducing transition friction. Prompt library improvements from retrospectives are reaching other teams through L&D sessions.'
        },
        evaluatorNote:'Ask how many practitioners are currently on a Track 2 learning programme for the next maturity level. If the answer is zero, learning culture is not driving AI adoption readiness.'
      },
      {
        id:'d5_collaboration', name:'Cross-functional Collaboration',
        description:'Whether the team\'s AI adoption decisions include the right people — particularly Compliance SME, Architect, and Delivery Lead.',
        levelType:'alt',
        anchors:{
          1:'AI adoption is driven by the technology team in isolation. Compliance and business functions are consulted after decisions are made.',
          3:'Compliance SME is involved in Sprint 0. Architect reviews AI-executable story categorisation. Delivery Lead manages stakeholder communication.',
          5:'All seven Sprint 0 gate owners participate actively. Cross-functional involvement is a prerequisite for sprint start, not a courtesy.'
        },
        evaluatorNote:'Ask the Compliance SME and Architect whether they were involved in the last Sprint 0. Ask specifically which gate they owned and what they confirmed.'
      }
    ]
  },
  {
    id:'d6', code:'D6', name:'Governance & Compliance',
    description:'Non-negotiable in FS. A team cannot claim a high overall score if it scores below Level 3 on any D6 sub-dimension — governance gaps create regulatory risk regardless of other dimension strength.',
    color:'#ef4444',
    blocking:true,
    subDimensions:[
      {
        id:'d6_ai_governance', name:'AI Governance',
        description:'The formal structures, policies, and oversight mechanisms governing AI adoption and AI-generated output.',
        levelType:'full',
        anchors:{
          1:'No AI governance policy. AI tools are used without formal approval or oversight.',
          2:'An AI usage policy exists but is not consistently enforced. Some tools are in use without data handling agreements.',
          3:'A named AI governance owner exists. All AI tools in use have been formally approved through a governance process. Data handling agreements are confirmed.',
          4:'AI governance includes sprint-level obligations — Sprint 0 gate owner for compliance, checkpoint accountability register, prompt log retention policy. Governance owner reviews AI performance data quarterly.',
          5:'AI governance is embedded in every sprint ceremony. The CoE functions as the organisational governance body. Governance decisions are evidence-based and documented.'
        },
        evaluatorNote:'Ask to see the AI governance policy. Ask who approved the AI tools currently in use. Ask when the governance policy was last reviewed. If any of these cannot be answered with specific evidence, governance is below Level 3.'
      },
      {
        id:'d6_audit', name:'Audit Trail',
        description:'The completeness, accuracy, and retrievability of records documenting AI-generated output in production.',
        levelType:'full',
        anchors:{
          1:'No audit trail for AI-generated output. AI contributions to production systems are not distinguished from human contributions.',
          2:'Some logging of AI tool usage exists but is not structured, not linked to specific outputs, and not retained systematically.',
          3:'Prompt log exists with named generator and named approver for each AI-generated output. Logs are stored in a designated repository, not in individual tools or documents.',
          4:'Prompt log includes all ten fields defined in Appendix A. Logs are retained indefinitely. Logs are queryable — a specific output can be retrieved and traced to its prompt within one hour.',
          5:'Audit trail has been tested against a simulated regulatory query. Retrieval time is documented. Audit trail coverage is 100% — no AI-generated output in production without a corresponding log entry.'
        },
        evaluatorNote:'Request to retrieve the prompt log entry for a specific AI-generated feature in production. Time how long it takes. If it takes more than one hour, or if the entry is incomplete, audit trail maturity is below Level 4. If no entry exists, it is Level 1.'
      },
      {
        id:'d6_regulatory', name:'Regulatory Compliance',
        description:'The team\'s ability to demonstrate that AI-generated output in regulated processes meets applicable regulatory requirements.',
        levelType:'full',
        anchors:{
          1:'Regulatory compliance is assumed. No specific process for verifying that AI-generated output meets regulatory requirements.',
          2:'Regulatory compliance is checked at the story level but informally. No Compliance SME gate in the sprint process.',
          3:'Compliance SME gate is a Sprint 0 requirement for regulated stories. Logic maps accompany AI-generated implementations of regulated processes. Compliance SME signs off on DoD for regulated stories.',
          4:'Regulated story type register exists and is reviewed quarterly. Logic maps are formatted for regulatory submission. Compliance SME has confirmed in writing which story types are permissible for AI execution.',
          5:'Regulatory audit readiness has been demonstrated — at least one simulated regulatory review has been conducted against AI-generated output in a regulated process, and the team can retrieve all required evidence within the expected timeframe.'
        },
        evaluatorNote:'Ask to see the regulated story type register. Ask the Compliance SME to describe the last logic map they reviewed. If neither exists in a concrete form, regulatory compliance governance is below Level 3.'
      },
      {
        id:'d6_third_party', name:'Third-Party AI Risk',
        description:'The governance of risk introduced by external AI vendors, models, and platforms.',
        levelType:'full',
        anchors:{
          1:'No third-party AI risk assessment. External AI tools are adopted without vendor risk review.',
          2:'Vendor risk assessment exists for the primary AI tool. Data processing agreements are in place.',
          3:'Third-party AI risk register exists. All AI tools in use have been assessed. FS-specific risks (data residency, model explainability, vendor dependency) are documented.',
          4:'Third-party AI risk is reviewed when new tools are proposed and when vendor terms change. Model provider updates are assessed for impact before adoption. Alternative providers are identified for critical AI functions.',
          5:'Third-party AI risk is integrated into the organisation\'s standard vendor risk management programme. AI vendor concentration risk is managed — no single vendor dependency for critical AI execution functions.'
        },
        evaluatorNote:'Ask how the team would respond if their primary AI coding assistant became unavailable for 48 hours. If there is no answer, third-party AI risk has not been assessed.'
      },
      {
        id:'d6_incident_response', name:'AI Incident Response',
        description:'The team\'s ability to detect, respond to, and recover from incidents caused by AI-generated output.',
        levelType:'full',
        anchors:{
          1:'No AI incident response process. Incidents involving AI-generated output are treated the same as standard software incidents.',
          2:'AI incidents are recognised as a category. MTTR is tracked. Post-incident reviews occur.',
          3:'AI incident response playbook exists. AI-specific incident types are defined (hallucination in production, model version mismatch, prompt injection). Incidents are traceable to the prompt log within one hour.',
          4:'AI incident response includes regulatory notification assessment — for incidents involving regulated processes, the Compliance SME is notified within a defined timeframe. Incident data feeds framework improvements.',
          5:'AI incident response has been tested. MTTR for AI-specific incidents is documented and declining. At least one AI incident has been reviewed by the independent evaluator or CoE and used to improve the framework.'
        },
        evaluatorNote:'Ask to walk through what would happen if an AI-generated credit decision was later found to be incorrect. Who would be notified, in what order, within what timeframe? If the team cannot walk through this confidently, incident response is below Level 3.'
      },
      {
        id:'d6_ip', name:'IP & Code Ownership',
        description:'The clarity of intellectual property rights and code ownership for AI-generated output.',
        levelType:'full',
        anchors:{
          1:'IP and ownership of AI-generated code is unclear. No policy exists. Developers assume ownership defaults to them.',
          2:'An IP policy for AI-generated code exists but is not consistently applied. Client agreements may not address AI-generated output.',
          3:'IP policy is documented and confirmed with the client. AI-generated code is clearly identified in the codebase. Client agreements explicitly address AI-generated output.',
          4:'IP and ownership is addressed in every Sprint 0 gate. Prompt log entries include an IP flag for client-sensitive output. Named approver accountability model addresses ownership of approved AI output.',
          5:'IP governance is integrated into the legal review process. AI-generated code is tagged in the repository. Ownership is not ambiguous at any point in the delivery pipeline.'
        },
        evaluatorNote:'Ask who owns the AI-generated code in the current engagement — the client, the delivery organisation, or the AI vendor? If this question produces uncertainty or disagreement, IP governance is below Level 3.'
      }
    ]
  }
];

/* ─── FLATTEN SUB-DIMENSIONS for quick lookup ─── */
AIT.SUB_DIM_MAP = {};
AIT.DIMENSIONS.forEach(function(d){
  d.subDimensions.forEach(function(sd){
    AIT.SUB_DIM_MAP[sd.id] = Object.assign({}, sd, { dimensionId: d.id, dimensionName: d.name, dimensionCode: d.code, dimensionColor: d.color });
  });
});

/* ─── RECONCILIATION RULES (for display in about/report) ─── */
AIT.RECON_RULES = [
  { pattern:'All three agree within 1 point', flag:'Confirmed Score', action:'Use the average. No further action required.' },
  { pattern:'Leader scores 2+ points above Team Lead', flag:'Perception Gap', action:'Independent evaluator conducts follow-up interviews on this sub-dimension. Score held pending reconciliation.' },
  { pattern:'Independent evaluator scores below both', flag:'Reality Gap', action:'Independent evaluator presents interview evidence to both parties. Score set at evaluator\'s level pending a documented response from leadership.' },
  { pattern:'Team Lead scores 2+ points above Leader', flag:'Implementation Gap', action:'Signals the team is doing something leadership is unaware of — or that the team lead is scoring aspiration rather than practice. Evaluator probes with specific examples.' }
];

/* ─── SCORE COLORS ─── */
AIT.scoreColor = function(score){
  if(!score) return '#e2e8f0';
  var map = { 1:'#ef4444', 2:'#f97316', 3:'#eab308', 4:'#84cc16', 5:'#22c55e' };
  return map[score] || '#e2e8f0';
};
AIT.scoreLabel = function(score){
  if(!score) return '—';
  var map = { 1:'L1', 2:'L2', 3:'L3', 4:'L4', 5:'L5' };
  return map[score] || '—';
};

/* ─── SECTOR OPTIONS ─── */
AIT.SECTORS = ['Banking','FinTech','Insurance','Capital Markets','Asset Management','Payments','RegTech','Wealth Management','Other Financial Services','Technology','Healthcare','Retail','Manufacturing','Consulting','Other'];
AIT.COMPANY_TYPES = ['Private','Public','Partnership','LLP','Joint Venture','Other'];
AIT.COMPANY_SIZES = ['Small (< 50)','Medium (50–250)','Large (250–1000)','XL (1000–5000)','MNC (5000+)'];

/* ─── EVALUATOR ROLES ─── */
AIT.EVAL_ROLES = {
  1: { title:'Evaluator 1 — Leadership',    description:'A person in a leadership position with knowledge of the company\'s AI landscape, tools in use, and AI budget allocation.',  short:'Leadership' },
  2: { title:'Evaluator 2 — Tech Lead / PM', description:'A technical lead or product/project manager with hands-on delivery knowledge.',                                           short:'Tech Lead / PM' },
  3: { title:'Evaluator 3 — Independent',   description:'An external independent evaluator who conducts 2–3 hours of stakeholder interviews before completing the assessment.',     short:'Independent' }
};

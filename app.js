/**
 * Candela Labs Commercial Underwriting Dashboard - Core JS Engine
 * Handles State, Stepper routing, Canvas Map drawing, Decision logic, Roles dropdown and Event logs.
 */

// Global Application State
const appState = {
  currentRole: 'underwriter',
  activeView: 'dashboard-view',
  selectedQuoteNo: null,
  currentStep: 0,
  
  // Rule configs (Admin adjustable)
  adminRules: {
    scorePreferred: 68,
    scoreDeferred: 40,
    maxClaims: 3,
    accumRadius: 5,
    maxCapacity: 15000000,
    netRetention: 1000000,
    treatyCapacity: 5000000
  },

  // Authority limits configuration
  authorityLimits: {
    junior_underwriter: { name: 'Junior Underwriter', limit: 1000000, premiumLimit: 15000, products: ['Property', 'Liability', 'Cargo'] },
    underwriter: { name: 'Underwriter', limit: 2500000, premiumLimit: 40000, products: ['Property', 'Liability', 'Cargo'] },
    senior_underwriter: { name: 'Senior Underwriter', limit: 5000000, premiumLimit: 75000, products: ['Property', 'Liability', 'Cargo'] },
    underwriting_manager: { name: 'Underwriting Manager', limit: 10000000, premiumLimit: 150000, products: ['Property', 'Liability', 'Cargo'] },
    reinsurance_manager: { name: 'Reinsurance Manager', limit: 99999999, premiumLimit: 9999999, products: ['Property', 'Liability', 'Cargo'] }
  },

  // Personas / Roles list with descriptions
  personas: [
    { key: 'underwriter', name: 'David Wright', roleTitle: 'Underwriter', email: 'd.wright@candelalabs.com', initials: 'DW', desc: 'Standard authority review' },
    { key: 'senior_underwriter', name: 'Sarah Jenkins', roleTitle: 'Senior Underwriter', email: 's.jenkins@candelalabs.com', initials: 'SJ', desc: 'Escalations & high risks' },
    { key: 'underwriting_manager', name: 'Robert Vance', roleTitle: 'Underwriting Manager', email: 'r.vance@candelalabs.com', initials: 'RV', desc: 'Manager capacity overrides' },
    { key: 'reinsurance_manager', name: 'Alistair Cole', roleTitle: 'Reinsurance Manager', email: 'a.cole@candelalabs.com', initials: 'AC', desc: 'Facultative placements' },
    { key: 'agent', name: 'Alistair Agency Corp', roleTitle: 'Commercial Agent', email: 'agent@alistairagency.com', initials: 'AA', desc: 'Quotation submitter view' },
    { key: 'admin', name: 'Admin Director', roleTitle: 'System Administrator', email: 'admin@candelalabs.com', initials: 'AD', desc: 'Rules & matrix settings' },
    { key: 'operations', name: 'Operations Hub', roleTitle: 'Ops Administrator', email: 'ops@candelalabs.com', initials: 'OH', desc: 'Quotation registration' }
  ],

  // Mock Database
  quotations: [
    {
      quoteNo: 'QT2024001',
      customerName: 'Acme Manufacturing Ltd',
      lob: 'Property',
      product: 'Commercial Property Policy',
      sumInsured: 2200000,
      premiumEstimate: 32000,
      occupancy: 'Light Engineering & Warehousing',
      latitude: 53.4839,
      longitude: -2.2446, // Manchester Center
      claims: 1,
      claimsDetails: 'Minor water leakage claim (£5,000) resolved in 2024.',
      riskScore: 76,
      riskCategory: 'Preferred',
      slaHours: 24,
      owner: 'David Wright',
      assignedRole: 'underwriter',
      status: 'Underwriting Review',
      documents: [
        { name: 'Property Survey Report', uploaded: true, type: 'pdf' },
        { name: 'Financial Statements 3Y', uploaded: true, type: 'pdf' },
        { name: 'Fire Risk Assessment', uploaded: true, type: 'pdf' }
      ],
      remarks: [
        { date: '2026-06-23 10:15', user: 'Operations Admin', role: 'operations', note: 'Quotation initiated from Manchester branch office.' },
        { date: '2026-06-23 11:30', user: 'System Engine', role: 'system', note: 'Auto-scoping: Risk category designated as Preferred.' }
      ],
      chatHistory: [
        { sender: 'underwriter', text: 'Hi Team, please verify if the warehouse fire alarm system has direct notification with local response services.', time: '2026-06-23 14:05' },
        { sender: 'agent', text: 'Yes David, checking. Uploaded the fire risk assessment which confirms dual-path cellular signaling is in place.', time: '2026-06-23 14:22' }
      ],
      timeline: [
        { label: 'Quote Created', date: '2026-06-23 10:15', user: 'Operations Admin', status: 'completed' },
        { label: 'Risk Details Configured', date: '2026-06-23 10:30', user: 'Operations Admin', status: 'completed' },
        { label: 'Documents Uploaded', date: '2026-06-23 11:00', user: 'Operations Admin', status: 'completed' },
        { label: 'Risk Assessment Executed', date: '2026-06-23 11:30', user: 'System Engine', status: 'completed' },
        { label: 'Underwriter Assigned', date: '2026-06-23 11:30', user: 'System Engine', status: 'completed' },
        { label: 'Underwriting Review', date: 'In Progress', user: 'David Wright', status: 'active' },
        { label: 'Reinsurance Referral', date: 'Pending', user: 'TBD', status: 'pending' },
        { label: 'Final Issuance', date: 'Pending', user: 'TBD', status: 'pending' }
      ]
    },
    {
      quoteNo: 'QT2024002',
      customerName: 'Riverside Hotels Group',
      lob: 'Property',
      product: 'Commercial Property Policy',
      sumInsured: 6500000,
      premiumEstimate: 85000,
      occupancy: 'Hospitality & Leisure',
      latitude: 53.4792,
      longitude: -2.2512, // Close to river Irwell, Manchester
      claims: 2,
      claimsDetails: 'Two flood damage claims (£45,000 aggregate) in 2025.',
      riskScore: 55,
      riskCategory: 'Referred',
      slaHours: 4,
      owner: 'TBD',
      assignedRole: 'senior_underwriter',
      status: 'Senior Approval Pending',
      documents: [
        { name: 'Flood Risk Survey Plan', uploaded: true, type: 'pdf' },
        { name: 'Business Continuity Review', uploaded: true, type: 'pdf' },
        { name: 'Loss Run Reports 5Y', uploaded: true, type: 'pdf' }
      ],
      remarks: [
        { date: '2026-06-24 08:00', user: 'System Engine', role: 'system', note: 'Auto-referral triggered: Sum Insured (£6.5M) exceeds Underwriter authority limit of £2.5M.' },
        { date: '2026-06-24 09:12', user: 'David Wright', role: 'underwriter', note: 'Sum Insured exceeds authority. Forwarding to Senior Underwriter. Noted flood claims in 2025 need review.' }
      ],
      chatHistory: [
        { sender: 'underwriter', text: 'Senior review triggered due to sum insured of £6.5m. We need confirmation on whether flood defenses have been upgraded.', time: '2026-06-24 08:30' }
      ],
      timeline: [
        { label: 'Quote Created', date: '2026-06-24 07:30', user: 'Agent Operations', status: 'completed' },
        { label: 'Risk Details Configured', date: '2026-06-24 07:45', user: 'Agent Operations', status: 'completed' },
        { label: 'Documents Uploaded', date: '2026-06-24 08:00', user: 'Agent Operations', status: 'completed' },
        { label: 'Risk Assessment Executed', date: '2026-06-24 08:00', user: 'System Engine', status: 'completed' },
        { label: 'Underwriter Referral', date: '2026-06-24 09:12', user: 'David Wright', status: 'completed' },
        { label: 'Senior Underwriter Assigned', date: 'In Progress', user: 'Sarah Jenkins (Senior UW)', status: 'active' },
        { label: 'Reinsurance Referral', date: 'Pending', user: 'Reinsurance Manager', status: 'pending' },
        { label: 'Final Issuance', date: 'Pending', user: 'TBD', status: 'pending' }
      ]
    },
    {
      quoteNo: 'QT2024003',
      customerName: 'Tech Ventures Labs',
      lob: 'Liability',
      product: 'General Liability Policy',
      sumInsured: 12000000,
      premiumEstimate: 165000,
      occupancy: 'R&D Lab / Tech Incubator',
      latitude: 53.4862,
      longitude: -2.2312,
      claims: 4,
      claimsDetails: 'Multiple IP infringement and third-party bodily injury claims.',
      riskScore: 28,
      riskCategory: 'Deferred',
      slaHours: 48,
      owner: 'TBD',
      assignedRole: 'underwriting_manager',
      status: 'Deferred',
      documents: [
        { name: 'Liability Loss Run', uploaded: false, type: 'pdf' },
        { name: 'Research Protocol Manual', uploaded: true, type: 'pdf' }
      ],
      remarks: [
        { date: '2026-06-24 10:00', user: 'System Engine', role: 'system', note: 'Decline trigger: High claims count (4) and Sum Insured (£12M) exceeds standard Underwriter threshold.' }
      ],
      chatHistory: [
        { sender: 'underwriter', text: 'This account has been deferred due to excessive claims frequency and insufficient liability loss documentation.', time: '2026-06-24 11:00' }
      ],
      timeline: [
        { label: 'Quote Created', date: '2026-06-24 10:00', user: 'Agent Operations', status: 'completed' },
        { label: 'Risk Details Configured', date: '2026-06-24 10:10', user: 'Agent Operations', status: 'completed' },
        { label: 'Documents Uploaded', date: 'Pending Check', user: 'Agent Operations', status: 'active' },
        { label: 'Risk Assessment Executed', date: 'Blocked', user: 'System Engine', status: 'breached' }
      ]
    },
    {
      quoteNo: 'QT2024004',
      customerName: 'Apex Logistics',
      lob: 'Cargo',
      product: 'Marine Cargo & Transit',
      sumInsured: 850000,
      premiumEstimate: 12000,
      occupancy: 'Freight Logistics & Haulage',
      latitude: 51.5074,
      longitude: -0.1278, // London Center
      claims: 0,
      claimsDetails: 'Clean loss history for the past 5 years.',
      riskScore: 92,
      riskCategory: 'Preferred',
      slaHours: 0,
      owner: 'David Wright',
      assignedRole: 'underwriter',
      status: 'Quote Issued',
      documents: [
        { name: 'Transit Insurance Schedule', uploaded: true, type: 'pdf' },
        { name: 'Fleet Security Verification', uploaded: true, type: 'pdf' }
      ],
      remarks: [
        { date: '2026-06-22 09:00', user: 'David Wright', role: 'underwriter', note: 'Risk approved automatically. Sum Insured is within limits (£850K) and score is excellent (92).' }
      ],
      chatHistory: [],
      timeline: [
        { label: 'Quote Created', date: '2026-06-22 08:30', user: 'Agent Operations', status: 'completed' },
        { label: 'Risk Assessment', date: '2026-06-22 08:45', user: 'System Engine', status: 'completed' },
        { label: 'Underwriter Decision', date: '2026-06-22 09:00', user: 'David Wright', status: 'completed' },
        { label: 'Quote Issued', date: '2026-06-22 10:15', user: 'Operations Admin', status: 'completed' }
      ]
    },
    {
      quoteNo: 'QT2024005',
      customerName: 'Manchester ChemCo Ltd',
      lob: 'Property',
      product: 'Commercial Property Policy',
      sumInsured: 4800000,
      premiumEstimate: 62000,
      occupancy: 'Chemical Processing & Storage',
      latitude: 53.4682,
      longitude: -2.2592, // Close to Port / Industrial Canal
      claims: 2,
      claimsDetails: 'Chemical spillage claim in 2024 (£20,000), minor fire in 2025 (£15,000).',
      riskScore: 48,
      riskCategory: 'Referred',
      slaHours: 12,
      owner: 'TBD',
      assignedRole: 'reinsurance_manager',
      status: 'Reinsurance Review',
      documents: [
        { name: 'Environmental Impact Audit', uploaded: true, type: 'pdf' },
        { name: 'Hazardous Cargo Safety Protocol', uploaded: true, type: 'pdf' },
        { name: 'Property Survey Report', uploaded: true, type: 'pdf' }
      ],
      remarks: [
        { date: '2026-06-23 15:00', user: 'System Engine', role: 'system', note: 'Reinsurance Referral: Sum Insured (£4.8M) is high-hazard occupancy (Chemical Storage) requiring treaty verification.' }
      ],
      chatHistory: [
        { sender: 'underwriter', text: 'This chemical storage risk requires verification of hazardous material containment dikes.', time: '2026-06-23 16:30' }
      ],
      timeline: [
        { label: 'Quote Created', date: '2026-06-23 14:00', user: 'Agent Operations', status: 'completed' },
        { label: 'Risk Details Configured', date: '2026-06-23 14:15', user: 'Agent Operations', status: 'completed' },
        { label: 'Risk Assessment Executed', date: '2026-06-23 15:00', user: 'System Engine', status: 'completed' },
        { label: 'Underwriter Referral', date: '2026-06-23 15:10', user: 'David Wright', status: 'completed' },
        { label: 'Reinsurance Referral Triggered', date: '2026-06-23 15:30', user: 'System Engine', status: 'completed' },
        { label: 'Reinsurance Review', date: 'In Progress', user: 'Reinsurance team', status: 'active' }
      ]
    }
  ],

  // Notifications Queue
  notifications: [
    { id: 1, title: 'New Referral Assignment', desc: 'QT2024002 (Riverside Hotels) has been referred to Senior Underwriter queue.', time: '2h ago', unread: true },
    { id: 2, title: 'SLA Breach Threat', desc: 'QT2024002 is within 4 hours of SLA threshold breach!', time: '1h ago', unread: true },
    { id: 3, title: 'Clarification Response', desc: 'Agent replied on QT2024001 (Acme Manufacturing). View docs.', time: '30m ago', unread: true },
    { id: 4, title: 'Accumulation Warning', desc: 'Risk at Manchester ChemCo is nearing cumulative branch limits.', time: '10m ago', unread: true }
  ],

  // Audit Logs
  auditLogs: [
    { timestamp: '2026-06-24 16:15:32', quoteNo: 'QT2024002', user: 'Sarah Jenkins', role: 'Senior Underwriter', action: 'Referred from Junior Queue', transition: 'Underwriting -> Senior Review', remarks: 'Sum insured exceeds basic underwriter limit.' },
    { timestamp: '2026-06-24 15:30:10', quoteNo: 'QT2024005', user: 'System Rules', role: 'Automation Engine', action: 'Trigger Reinsurance recommendation', transition: 'Assessment -> Reinsurance Review', remarks: 'Chemical Risk sum insured exceeds treaty retention.' },
    { timestamp: '2026-06-24 14:22:15', quoteNo: 'QT2024001', user: 'Agent Intermediary', role: 'Agent', action: 'Uploaded Fire Survey Doc', transition: 'Active', remarks: 'Attached documentation requested by UW.' },
    { timestamp: '2026-06-24 10:00:00', quoteNo: 'QT2024003', user: 'Agent Intermediary', role: 'Agent', action: 'Quotation Created', transition: 'New -> Draft', remarks: 'Quote submission for tech incubator facility.' }
  ]
};

// Wizard Draft Data
let quoteWizardData = {
  customerName: '',
  lob: 'Property',
  product: 'Commercial Property Policy',
  sumInsured: 1000000,
  premiumEstimate: 12000,
  occupancy: 'Office',
  latitude: 53.4808,
  longitude: -2.2426,
  claims: 0,
  claimsDetails: '',
  riskScore: 100,
  riskCategory: 'Preferred',
  documents: [],
  triggers: []
};

// Stepper steps configuration
const stepperSteps = [
  'Customer Details',
  'Location Details',
  'Occupancy Details',
  'Coverage Details',
  'Risk Questionnaire',
  'Claims History',
  'Upload Documents',
  'Risk Scoring',
  'Underwriting Review',
  'Reinsurance Scan',
  'Quote Issuance'
];

// Initialize application on load
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});

// App Controller Object
const app = {
  init() {
    // Setup Navigation Listeners
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
      item.addEventListener('click', (e) => {
        const viewId = item.getAttribute('data-view');
        this.switchView(viewId);
      });
    });

    // Theme Switcher
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      const themeIcon = document.getElementById('theme-icon');
      if (isDark) {
        themeIcon.setAttribute('data-lucide', 'sun');
      } else {
        themeIcon.setAttribute('data-lucide', 'moon');
      }
      this.drawAccumulationMap(); // Redraw map to adapt to new theme colors
      lucide.createIcons();
    });

    // Notification Drawer Switch
    const bellBtn = document.getElementById('bell-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const drawer = document.getElementById('notifications-drawer');

    bellBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      this.clearUnreadNotificationsBadge();
    });

    closeDrawerBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
    });

    // Top-Right Profile Dropdown Toggler
    const profileTrigger = document.getElementById('profile-menu-trigger');
    const profileDropdown = document.getElementById('profile-dropdown');

    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('open');
      profileTrigger.classList.toggle('active');
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!profileDropdown.contains(e.target) && !profileTrigger.contains(e.target)) {
        profileDropdown.classList.remove('open');
        profileTrigger.classList.remove('active');
      }
    });

    // Global Search Setup
    const searchInput = document.getElementById('global-search');
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      this.filterDashboardTable(q);
    });

    // Dashboard filters
    document.getElementById('filter-lob').addEventListener('change', () => this.applyDashboardFilters());
    document.getElementById('filter-risk').addEventListener('change', () => this.applyDashboardFilters());
    document.getElementById('filter-sla').addEventListener('change', () => this.applyDashboardFilters());
    document.getElementById('filter-branch').addEventListener('change', () => this.applyDashboardFilters());

    // Setup Chat Send Button
    document.getElementById('detail-send-chat-btn').addEventListener('click', () => {
      this.sendChatFromDetail();
    });
    document.getElementById('detail-chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.sendChatFromDetail();
      }
    });

    // Init Render
    this.renderRoleDropdownSwitcher();
    this.updateRoleViewContext();
    this.initCustomDropdowns();
    this.renderDashboardMetrics();
    this.renderDashboardTable();
    this.renderNotifications();
    this.renderAuthorityMatrix();
    this.renderAuditTrail();
    this.drawAccumulationMap();

    // Create Lucide Icons
    lucide.createIcons();
  },

  // Render Top-Right Dropdown switcher roles list
  renderRoleDropdownSwitcher() {
    const list = document.getElementById('dropdown-role-list');
    list.innerHTML = '';

    appState.personas.forEach(p => {
      // Choose icon for persona
      let icon = 'user';
      if (p.key === 'senior_underwriter') icon = 'shield-alert';
      if (p.key === 'underwriting_manager') icon = 'briefcase';
      if (p.key === 'reinsurance_manager') icon = 'globe';
      if (p.key === 'agent') icon = 'users';
      if (p.key === 'admin') icon = 'sliders';
      if (p.key === 'operations') icon = 'layers';

      const isActive = appState.currentRole === p.key;

      const div = document.createElement('div');
      div.className = `role-switch-item ${isActive ? 'active' : ''}`;
      div.innerHTML = `
        <div class="role-switch-icon-box">
          <i data-lucide="${icon}"></i>
        </div>
        <div class="role-switch-details">
          <h5>${p.name}</h5>
          <p>${p.roleTitle} — ${p.desc}</p>
        </div>
      `;

      div.addEventListener('click', () => {
        appState.currentRole = p.key;
        this.closeProfileDropdown();
        this.renderRoleDropdownSwitcher();
        this.updateRoleViewContext();
      });

      list.appendChild(div);
    });

    lucide.createIcons();
  },

  closeProfileDropdown() {
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileTrigger = document.getElementById('profile-menu-trigger');
    profileDropdown.classList.remove('open');
    profileTrigger.classList.remove('active');
  },

  simulateSignOut() {
    this.closeProfileDropdown();
    this.openModal(
      'Session Finished',
      '<p>You have signed out of the current underwriting sandbox session.</p>',
      '<button class="btn btn-primary" onclick="app.closeModal(); location.reload();">Restart Prototype</button>'
    );
  },

  // Role Management
  updateRoleViewContext() {
    const roleKey = appState.currentRole;
    const persona = appState.personas.find(p => p.key === roleKey);
    if (!persona) return;
    
    // Update Header trigger fields
    document.getElementById('header-avatar-initials').textContent = persona.initials;
    document.getElementById('header-user-name').textContent = persona.name;
    document.getElementById('header-user-role').textContent = persona.roleTitle;

    // Update Dropdown details fields
    document.getElementById('dropdown-avatar-initials').textContent = persona.initials;
    document.getElementById('dropdown-user-name').textContent = persona.name;
    document.getElementById('dropdown-user-email').textContent = persona.email;

    // Hide configure screens for non-admin
    const adminConfigMenuItem = document.querySelector('[data-view="admin-config-view"]');
    const authorityMenuItem = document.querySelector('[data-view="authority-matrix-view"]');
    
    if (roleKey === 'admin') {
      adminConfigMenuItem.style.display = 'block';
      authorityMenuItem.style.display = 'block';
    } else {
      adminConfigMenuItem.style.display = 'none';
      authorityMenuItem.style.display = 'none';
    }

    // Refresh active view
    this.switchView(appState.activeView);
    this.renderDashboardMetrics();
    this.renderDashboardTable();
    this.renderWorkQueueTable();
  },

  // View Routing Management
  switchView(viewId, quoteNo = null) {
    appState.activeView = viewId;
    this.stopMapAnimation();
    
    // Hide active menu states, apply to selected
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Toggle viewport section views
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.remove('active');
    });

    const activeViewEl = document.getElementById(viewId);
    if (activeViewEl) {
      activeViewEl.classList.add('active');
    }

    // Handle View-Specific Initializers
    if (viewId === 'new-quote-view') {
      appState.currentStep = 0;
      this.initQuotationStepper();
    } else if (viewId === 'work-queue-view') {
      this.renderWorkQueueTable();
    } else if (viewId === 'quote-detail-view' && quoteNo) {
      appState.selectedQuoteNo = quoteNo;
      this.renderQuotationDetailReview(quoteNo);
    } else if (viewId === 'risk-map-view') {
      this.startMapAnimation();
    } else if (viewId === 'authority-matrix-view') {
      this.renderAuthorityMatrix();
    } else if (viewId === 'admin-config-view') {
      this.loadAdminConfigValues();
    } else if (viewId === 'audit-trail-view') {
      this.renderAuditTrail();
    } else if (viewId === 'dashboard-view') {
      this.renderDashboardMetrics();
      this.renderDashboardTable();
    }

    lucide.createIcons();
  },

  // Dashboard metrics
  renderDashboardMetrics() {
    const quotes = appState.quotations;
    const role = appState.currentRole;
    
    // Filter quotes list based on role
    let visibleQuotes = quotes;
    if (role === 'agent') {
      // Agents only see quotes they are assigned to
      visibleQuotes = quotes.filter(q => q.quoteNo !== 'QT2024003'); // Simulated filter
    }

    const totalCreated = visibleQuotes.length;
    const preferredCount = visibleQuotes.filter(q => q.riskCategory === 'Preferred').length;
    const referredCount = visibleQuotes.filter(q => q.riskCategory === 'Referred').length;
    const deferredCount = visibleQuotes.filter(q => q.riskCategory === 'Deferred').length;
    const nearingSLA = visibleQuotes.filter(q => q.slaHours > 0 && q.slaHours <= 12).length;

    const metricsContainer = document.getElementById('dashboard-metrics');
    metricsContainer.innerHTML = `
      <div class="metric-card" onclick="app.filterByStatus('all')">
        <div class="metric-info">
          <h3>Total Quotations</h3>
          <div class="value">${totalCreated}</div>
        </div>
        <div class="metric-icon-box" style="background-color: var(--primary-light); color: var(--primary);">
          <i data-lucide="file-text"></i>
        </div>
      </div>

      <div class="metric-card preferred" onclick="app.filterByStatus('Preferred')">
        <div class="metric-info">
          <h3>Preferred Risks</h3>
          <div class="value">${preferredCount}</div>
        </div>
        <div class="metric-icon-box">
          <i data-lucide="shield-check"></i>
        </div>
      </div>

      <div class="metric-card referred" onclick="app.filterByStatus('Referred')">
        <div class="metric-info">
          <h3>Referred Risks</h3>
          <div class="value">${referredCount}</div>
        </div>
        <div class="metric-icon-box">
          <i data-lucide="alert-triangle"></i>
        </div>
      </div>

      <div class="metric-card deferred" onclick="app.filterByStatus('Deferred')">
        <div class="metric-info">
          <h3>Deferred Risks</h3>
          <div class="value">${deferredCount}</div>
        </div>
        <div class="metric-icon-box">
          <i data-lucide="alert-circle"></i>
        </div>
      </div>

      <div class="metric-card sla" onclick="app.filterByStatus('sla')">
        <div class="metric-info">
          <h3>SLA Nearing Breach</h3>
          <div class="value">${nearingSLA}</div>
        </div>
        <div class="metric-icon-box">
          <i data-lucide="clock"></i>
        </div>
      </div>
    `;
    
    lucide.createIcons();
  },

  // Dashboard Data Table rendering
  renderDashboardTable(filteredQuotes = null) {
    const list = filteredQuotes || appState.quotations;
    const tbody = document.getElementById('dashboard-table-body');
    const badge = document.getElementById('table-count-badge');
    
    tbody.innerHTML = '';
    badge.textContent = `${list.length} quotations`;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">No quotations found matching selected parameters.</td></tr>`;
      return;
    }

    list.forEach(q => {
      // Risk Category Badges
      let riskBadgeClass = 'badge-preferred';
      if (q.riskCategory === 'Referred') riskBadgeClass = 'badge-referred';
      if (q.riskCategory === 'Deferred') riskBadgeClass = 'badge-deferred';

      // Status Badges
      let statusBadgeClass = 'badge-pending';
      if (q.status === 'Approved' || q.status === 'Quote Issued') statusBadgeClass = 'badge-preferred';
      if (q.status === 'Deferred') statusBadgeClass = 'badge-deferred';
      
      // SLA Ageing Display
      let slaText = `${q.slaHours}h remaining`;
      let slaBadgeClass = '';
      if (q.slaHours === 0) {
        slaText = 'Resolved';
        slaBadgeClass = 'badge-preferred';
      } else if (q.slaHours <= 12) {
        slaBadgeClass = 'badge-sla';
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: #2563eb;">${q.quoteNo}</td>
        <td style="font-weight: 600;">${q.customerName}</td>
        <td>${q.lob} - ${q.product.substring(0, 12)}...</td>
        <td style="font-weight: 600;">£${q.sumInsured.toLocaleString()}</td>
        <td><span class="badge ${riskBadgeClass}">${q.riskCategory}</span></td>
        <td><span class="badge ${slaBadgeClass}">${slaText}</span></td>
        <td><span style="font-size: 0.85rem; color: var(--text-secondary);"><i data-lucide="user" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></i>${q.owner}</span></td>
        <td><span class="badge ${statusBadgeClass}">${q.status}</span></td>
      `;
      
      tr.addEventListener('click', () => {
        this.switchView('quote-detail-view', q.quoteNo);
      });
      tbody.appendChild(tr);
    });

    lucide.createIcons();
  },

  filterByStatus(statusType) {
    let filtered = appState.quotations;
    if (statusType === 'Preferred' || statusType === 'Referred' || statusType === 'Deferred') {
      filtered = appState.quotations.filter(q => q.riskCategory === statusType);
      document.getElementById('filter-risk').value = statusType;
    } else if (statusType === 'sla') {
      filtered = appState.quotations.filter(q => q.slaHours > 0 && q.slaHours <= 12);
      document.getElementById('filter-sla').value = 'breaching';
    } else {
      document.getElementById('filter-risk').value = 'all';
      document.getElementById('filter-sla').value = 'all';
    }
    this.renderDashboardTable(filtered);
  },

  applyDashboardFilters() {
    const lobVal = document.getElementById('filter-lob').value;
    const riskVal = document.getElementById('filter-risk').value;
    const slaVal = document.getElementById('filter-sla').value;
    const branchVal = document.getElementById('filter-branch').value;

    let filtered = appState.quotations;

    if (lobVal !== 'all') {
      filtered = filtered.filter(q => q.lob === lobVal);
    }
    if (riskVal !== 'all') {
      filtered = filtered.filter(q => q.riskCategory === riskVal);
    }
    if (slaVal === 'breaching') {
      filtered = filtered.filter(q => q.slaHours > 0 && q.slaHours <= 12);
    }
    if (branchVal !== 'all') {
      if (branchVal === 'London') {
        filtered = filtered.filter(q => q.latitude < 52.0);
      } else {
        filtered = filtered.filter(q => q.latitude >= 52.0);
      }
    }

    this.renderDashboardTable(filtered);
  },

  filterDashboardTable(query) {
    if (!query) {
      this.renderDashboardTable();
      return;
    }
    const filtered = appState.quotations.filter(q => {
      return q.quoteNo.toLowerCase().includes(query) ||
             q.customerName.toLowerCase().includes(query) ||
             q.occupancy.toLowerCase().includes(query) ||
             q.lob.toLowerCase().includes(query);
    });
    this.renderDashboardTable(filtered);
  },

  // Underwriter Work Queue Filtering
  filterQueue(type, btn) {
    btn.parentNode.querySelectorAll('button').forEach(b => b.classList.remove('btn-active'));
    btn.classList.add('btn-active');

    let list = appState.quotations;
    
    if (type === 'Preferred' || type === 'Referred' || type === 'Deferred') {
      list = list.filter(q => q.riskCategory === type);
    } else if (type === 'clarification') {
      list = list.filter(q => q.chatHistory.length > 0 && q.chatHistory[q.chatHistory.length - 1].sender === 'agent');
    } else if (type === 'docs') {
      list = list.filter(q => q.documents.some(d => !d.uploaded));
    } else if (type === 'reinsurance') {
      list = list.filter(q => q.status === 'Reinsurance Review');
    }

    this.renderWorkQueueTable(list);
  },

  renderWorkQueueTable(customList = null) {
    const rawList = customList || appState.quotations;
    const tbody = document.getElementById('work-queue-table-body');
    tbody.innerHTML = '';

    const role = appState.currentRole;
    let list = rawList;
    if (role === 'underwriter') {
      list = rawList.filter(q => q.assignedRole === 'underwriter');
    } else if (role === 'senior_underwriter') {
      list = rawList.filter(q => q.assignedRole === 'senior_underwriter' || q.riskCategory === 'Referred');
    } else if (role === 'underwriting_manager') {
      list = rawList.filter(q => q.assignedRole === 'underwriting_manager' || q.riskScore < 30);
    } else if (role === 'reinsurance_manager') {
      list = rawList.filter(q => q.assignedRole === 'reinsurance_manager' || q.status === 'Reinsurance Review');
    } else if (role === 'agent') {
      list = rawList.filter(q => q.status !== 'Deferred');
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">No items currently in your queue.</td></tr>`;
      return;
    }

    list.forEach(q => {
      let riskBadgeClass = 'badge-preferred';
      if (q.riskCategory === 'Referred') riskBadgeClass = 'badge-referred';
      if (q.riskCategory === 'Deferred') riskBadgeClass = 'badge-deferred';

      let slaText = `${q.slaHours}h remaining`;
      let slaBadgeClass = '';
      if (q.slaHours === 0) {
        slaText = 'Resolved';
        slaBadgeClass = 'badge-preferred';
      } else if (q.slaHours <= 12) {
        slaBadgeClass = 'badge-sla';
      }

      let nextAction = 'Review details';
      if (q.status === 'Reinsurance Review') nextAction = 'Verify retention';
      if (q.status === 'Senior Approval Pending') nextAction = 'Assess Referral';
      if (q.documents.some(d => !d.uploaded)) nextAction = 'Request Docs';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: #2563eb;">${q.quoteNo}</td>
        <td style="font-weight: 600;">${q.customerName}</td>
        <td>${q.lob} - ${q.product}</td>
        <td style="font-weight: 600;">£${q.sumInsured.toLocaleString()}</td>
        <td><span class="badge ${riskBadgeClass}">${q.riskCategory}</span></td>
        <td><span class="badge ${slaBadgeClass}">${slaText}</span></td>
        <td><span style="font-size: 0.85rem; font-weight: 500; color: var(--text-secondary);">${q.assignedRole.toUpperCase().replace('_', ' ')}</span></td>
        <td><button class="btn btn-secondary btn-sm" style="padding: 4px 8px; font-size: 0.75rem;">${nextAction}</button></td>
      `;
      tr.addEventListener('click', () => {
        this.switchView('quote-detail-view', q.quoteNo);
      });
      tbody.appendChild(tr);
    });

    lucide.createIcons();
  },

  // 11-Step Stepper Management
  initQuotationStepper() {
    const headerList = document.getElementById('stepper-header-list');
    headerList.innerHTML = '';

    stepperSteps.forEach((step, idx) => {
      const isCompleted = idx < appState.currentStep;
      const isActive = idx === appState.currentStep;
      
      const stepDiv = document.createElement('div');
      stepDiv.className = `stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
      
      stepDiv.innerHTML = `
        <div class="step-bubble">${isCompleted ? '✓' : idx + 1}</div>
        <div class="step-label">${step}</div>
        ${idx < stepperSteps.length - 1 ? '<div class="stepper-progress-line"></div>' : ''}
      `;
      
      stepDiv.addEventListener('click', () => {
        if (idx <= appState.currentStep || isCompleted) {
          appState.currentStep = idx;
          this.renderQuotationStepperForm();
        }
      });
      headerList.appendChild(stepDiv);
    });

    this.renderQuotationStepperForm();
  },

  renderQuotationStepperForm() {
    const formBox = document.getElementById('wizard-form-box');
    formBox.innerHTML = '';

    const stepIndex = appState.currentStep;
    const isLastStep = stepIndex === stepperSteps.length - 1;

    let formHTML = '';

    switch (stepIndex) {
      case 0: // Customer & Business Details
        formHTML = `
          <div class="wizard-title-block">
            <h3>Customer & Business Details</h3>
            <p>Gather general commercial company registration and core contact information.</p>
          </div>
          <div class="wizard-grid">
            <div class="form-field">
              <label class="required">Customer / Corporate Entity Name</label>
              <input type="text" class="form-input" id="ws-cust-name" value="${quoteWizardData.customerName}" placeholder="e.g. Globex Logistics Ltd" required>
            </div>
            <div class="form-field">
              <label class="required">Company Registration Number</label>
              <input type="text" class="form-input" placeholder="e.g. 08129934" required>
            </div>
            <div class="form-field">
              <label class="required">Commercial LOB</label>
              <select class="form-select" id="ws-lob" onchange="app.updateProductSelect(this.value)">
                <option value="Property" ${quoteWizardData.lob === 'Property' ? 'selected' : ''}>Commercial Property</option>
                <option value="Liability" ${quoteWizardData.lob === 'Liability' ? 'selected' : ''}>General Liability</option>
                <option value="Cargo" ${quoteWizardData.lob === 'Cargo' ? 'selected' : ''}>Marine Cargo & Transit</option>
              </select>
            </div>
            <div class="form-field">
              <label>Select Product Plan</label>
              <select class="form-select" id="ws-product">
                <option value="Commercial Property Policy">Commercial Property Policy</option>
                <option value="Commercial Combined Cover">Commercial Combined Cover</option>
              </select>
            </div>
          </div>
        `;
        break;

      case 1: // Risk Location Details
        formHTML = `
          <div class="wizard-title-block">
            <h3>Risk Location Details</h3>
            <p>Input correct latitude and longitude coordinates to execute risk accumulation check.</p>
          </div>
          <div class="wizard-grid">
            <div class="form-field">
              <label class="required">Address Line 1</label>
              <input type="text" class="form-input" placeholder="e.g. 10 Canal Street" required>
            </div>
            <div class="form-field">
              <label class="required">Postcode / City</label>
              <input type="text" class="form-input" placeholder="e.g. M1 3HE, Manchester" required>
            </div>
            <div class="form-field">
              <label class="required">Latitude Coordinate</label>
              <input type="number" step="0.0001" class="form-input" id="ws-lat" value="${quoteWizardData.latitude}">
            </div>
            <div class="form-field">
              <label class="required">Longitude Coordinate</label>
              <input type="number" step="0.0001" class="form-input" id="ws-lng" value="${quoteWizardData.longitude}">
            </div>
          </div>
        `;
        break;

      case 2: // Occupancy / Trade Details
        formHTML = `
          <div class="wizard-title-block">
            <h3>Occupancy / Trade Details</h3>
            <p>Specify the commercial operational trade of the entity for hazard grading.</p>
          </div>
          <div class="wizard-grid">
            <div class="form-field">
              <label class="required">Trade / Occupancy Group</label>
              <select class="form-select" id="ws-occupancy">
                <option value="Office" ${quoteWizardData.occupancy === 'Office' ? 'selected' : ''}>General Commercial Office</option>
                <option value="Light Engineering & Warehousing" ${quoteWizardData.occupancy.includes('Warehousing') ? 'selected' : ''}>Light Engineering & Warehousing</option>
                <option value="Chemical Processing & Storage" ${quoteWizardData.occupancy.includes('Chemical') ? 'selected' : ''}>Chemical Processing & Storage (High Hazard)</option>
                <option value="Hospitality & Leisure" ${quoteWizardData.occupancy.includes('Hospitality') ? 'selected' : ''}>Hospitality & Leisure (Hotels, etc.)</option>
              </select>
            </div>
            <div class="form-field">
              <label>Years of Operation in Trade</label>
              <input type="number" class="form-input" value="10">
            </div>
          </div>
        `;
        break;

      case 3: // Coverage & Sum Insured
        formHTML = `
          <div class="wizard-title-block">
            <h3>Coverage & Sum Insured</h3>
            <p>Specify overall capacity limits and sum insured requirements.</p>
          </div>
          <div class="wizard-grid">
            <div class="form-field">
              <label class="required">Property / Liability Sum Insured (£)</label>
              <input type="number" class="form-input" id="ws-sum-insured" value="${quoteWizardData.sumInsured}">
            </div>
            <div class="form-field">
              <label>Target Premium Estimate (£)</label>
              <input type="number" class="form-input" id="ws-premium" value="${quoteWizardData.premiumEstimate}">
            </div>
          </div>
        `;
        break;

      case 4: // Risk Questionnaire
        formHTML = `
          <div class="wizard-title-block">
            <h3>Risk Questionnaire</h3>
            <p>Answers to key risk evaluation questions.</p>
          </div>
          <div class="wizard-grid full-width">
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
              <input type="checkbox" id="q-sprinkler" checked style="width: 18px; height: 18px;">
              <label for="q-sprinkler" style="font-weight: 500; font-size: 0.85rem;">Approved automatic sprinkler protection is installed throughout the risk premises.</label>
            </div>
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
              <input type="checkbox" id="q-security" checked style="width: 18px; height: 18px;">
              <label for="q-security" style="font-weight: 500; font-size: 0.85rem;">Dual-path cellular signaling alarms with direct police connection are operational.</label>
            </div>
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
              <input type="checkbox" id="q-hazmat" style="width: 18px; height: 18px;">
              <label for="q-hazmat" style="font-weight: 500; font-size: 0.85rem;">Flammable liquids or chemicals are stored on site exceeding 1,000 liters.</label>
            </div>
          </div>
        `;
        break;

      case 5: // Claims & Loss History
        formHTML = `
          <div class="wizard-title-block">
            <h3>Claims & Loss History</h3>
            <p>Prior loss history determines basic authority routing and scoring deductions.</p>
          </div>
          <div class="wizard-grid">
            <div class="form-field">
              <label class="required">Number of Claims (Last 3 Years)</label>
              <input type="number" class="form-input" id="ws-claims" value="${quoteWizardData.claims}">
            </div>
            <div class="form-field">
              <label>Details of Prior Losses (if any)</label>
              <textarea class="form-textarea" rows="3" id="ws-claims-details">${quoteWizardData.claimsDetails}</textarea>
            </div>
          </div>
        `;
        break;

      case 6: // Upload Documents
        formHTML = `
          <div class="wizard-title-block">
            <h3>Upload Documents</h3>
            <p>Attach necessary survey reports, valuation data, and audits.</p>
          </div>
          <div class="wizard-grid full-width">
            <div style="border: 2px dashed var(--border-color); padding: 24px; border-radius: var(--radius-lg); text-align: center; background-color: var(--bg-app);">
              <i data-lucide="upload-cloud" style="width: 42px; height: 42px; color: var(--text-muted); margin-bottom: 8px;"></i>
              <h4>Drag & drop survey documents here</h4>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Supported formats: PDF, DOCX (Max 25MB)</p>
              <button class="btn btn-secondary btn-sm" style="margin-top: 10px;">Select File</button>
            </div>
            <div style="margin-top: 16px;">
              <h4 style="font-size: 0.85rem; margin-bottom: 6px;">Required Checklists:</h4>
              <div style="display: flex; gap: 8px; align-items: center; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px;">
                <span class="badge badge-preferred" style="padding: 2px 6px;">✓</span> Property Survey Report
              </div>
              <div style="display: flex; gap: 8px; align-items: center; font-size: 0.8rem; color: var(--text-secondary);">
                <span class="badge badge-referred" style="padding: 2px 6px;">!</span> Financial Audit Report (Optional)
              </div>
            </div>
          </div>
        `;
        break;

      case 7: // Risk Assessment Result
        this.calculateDraftRiskScore();
        
        let riskBadgeClass = 'badge-preferred';
        if (quoteWizardData.riskCategory === 'Referred') riskBadgeClass = 'badge-referred';
        if (quoteWizardData.riskCategory === 'Deferred') riskBadgeClass = 'badge-deferred';

        formHTML = `
          <div class="wizard-title-block">
            <h3>Risk Assessment Result</h3>
            <p>Dynamic assessment output from Candela automatic rules engine.</p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px;">
            <div class="panel-card" style="text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: var(--bg-app);">
              <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Auto Risk Score</h4>
              <div style="font-size: 3rem; font-family: var(--font-display); font-weight: 800; color: #2563eb; line-height: 1;">${quoteWizardData.riskScore}</div>
              <span class="badge ${riskBadgeClass}" style="margin-top: 12px; font-size: 0.78rem; padding: 5px 12px;">${quoteWizardData.riskCategory} Risk</span>
            </div>
            <div>
              <h4 style="margin-bottom: 8px; font-size: 0.9rem;">Score Calculation Explanations:</h4>
              <ul style="font-size: 0.8rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px; padding-left: 14px;" id="ws-rules-list">
                <!-- Explanations populated below -->
              </ul>
            </div>
          </div>
        `;
        break;

      case 8: // Underwriting Review
        formHTML = `
          <div class="wizard-title-block">
            <h3>Underwriting Review & Referral Path</h3>
            <p>Determine authority routing requirements based on the risk profile.</p>
          </div>
          <div class="panel-card">
            <h4 style="font-size: 0.95rem; margin-bottom: 10px;"><i data-lucide="git-branch" style="vertical-align: middle; margin-right: 6px;"></i> Referral & Assignment Route</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.85rem;">
              <div>
                <p style="color: var(--text-muted); margin-bottom: 2px;">Assigned Review Level:</p>
                <p style="font-weight: 600;" id="ws-assignee-role">Underwriter (UW)</p>
              </div>
              <div>
                <p style="color: var(--text-muted); margin-bottom: 2px;">Referral Reason Code:</p>
                <p style="font-weight: 600;" id="ws-routing-reason">Sum Insured within Standard Authority limits.</p>
              </div>
            </div>
          </div>
        `;
        break;

      case 9: // Reinsurance Review
        formHTML = `
          <div class="wizard-title-block">
            <h3>Reinsurance Capacity Scan</h3>
            <p>Review limits against Net Retention (£1,000,000) and Treaty capacities (£5,000,000).</p>
          </div>
          <div class="panel-card">
            <h4 style="font-size: 0.95rem; margin-bottom: 10px;"><i data-lucide="shield" style="vertical-align: middle; margin-right: 6px;"></i> Reinsurance Recommendation</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.85rem;">
              <div>
                <p style="color: var(--text-muted); margin-bottom: 2px;">Treaty Position:</p>
                <p style="font-weight: 600;" id="ws-re-status">-</p>
              </div>
              <div>
                <p style="color: var(--text-muted); margin-bottom: 2px;">Placement Recommendation:</p>
                <p style="font-weight: 600;" id="ws-re-placement">-</p>
              </div>
            </div>
          </div>
        `;
        break;

      case 10: // Quote Review & Issue
        formHTML = `
          <div class="wizard-title-block">
            <h3>Review & Issue Quotation</h3>
            <p>Perform a final review of terms and bind the quotation package.</p>
          </div>
          <div class="panel-card" style="background-color: var(--primary-light); border-color: #2563eb;">
            <h4 style="color: #2563eb; font-size: 0.95rem; margin-bottom: 6px;">Binding Confirmation Summary</h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">By clicking <strong>Submit Quote</strong>, this quotation will be registered in the work list and routed to the assigned owner. A notification will be dispatched to the agent intermediation pool.</p>
          </div>
        `;
        break;
    }

    formBox.innerHTML = formHTML;

    // Append Navigation buttons
    const navDiv = document.createElement('div');
    navDiv.className = 'wizard-buttons';
    navDiv.innerHTML = `
      <button class="btn btn-secondary" onclick="app.prevStep()" ${stepIndex === 0 ? 'disabled' : ''}>Previous</button>
      <button class="btn btn-primary" onclick="app.nextStep()">${isLastStep ? 'Submit Quote' : 'Next'}</button>
    `;
    formBox.appendChild(navDiv);

    // Call inner view-specific callbacks
    if (stepIndex === 7) {
      this.populateDraftScoringExplanations();
    } else if (stepIndex === 8) {
      this.populateDraftReferralRouting();
    } else if (stepIndex === 9) {
      this.populateDraftReinsuranceScan();
    }

    this.initCustomDropdowns();
    lucide.createIcons();
  },

  updateProductSelect(lobVal) {
    const select = document.getElementById('ws-product');
    if (!select) return;
    select.innerHTML = '';
    if (lobVal === 'Property') {
      select.innerHTML = `
        <option value="Commercial Property Policy">Commercial Property Policy</option>
        <option value="Commercial Combined Cover">Commercial Combined Cover</option>
      `;
    } else if (lobVal === 'Liability') {
      select.innerHTML = `
        <option value="General Liability Policy">General Liability Policy</option>
        <option value="Professional Indemnity Cover">Professional Indemnity Cover</option>
      `;
    } else if (lobVal === 'Cargo') {
      select.innerHTML = `
        <option value="Marine Cargo & Transit">Marine Cargo & Transit</option>
        <option value="Air Freight Fleet Insurance">Air Freight Fleet Insurance</option>
      `;
    }
    
    this.initCustomDropdowns();
  },

  nextStep() {
    this.saveCurrentStepData();

    if (appState.currentStep < stepperSteps.length - 1) {
      appState.currentStep++;
      this.initQuotationStepper();
    } else {
      this.submitWizardQuote();
    }
  },

  prevStep() {
    this.saveCurrentStepData();
    if (appState.currentStep > 0) {
      appState.currentStep--;
      this.initQuotationStepper();
    }
  },

  saveCurrentStepData() {
    const step = appState.currentStep;
    if (step === 0) {
      quoteWizardData.customerName = document.getElementById('ws-cust-name').value || 'Unregistered Client';
      quoteWizardData.lob = document.getElementById('ws-lob').value;
      quoteWizardData.product = document.getElementById('ws-product').value;
    } else if (step === 1) {
      quoteWizardData.latitude = parseFloat(document.getElementById('ws-lat').value) || 53.4808;
      quoteWizardData.longitude = parseFloat(document.getElementById('ws-lng').value) || -2.2426;
    } else if (step === 2) {
      quoteWizardData.occupancy = document.getElementById('ws-occupancy').value;
    } else if (step === 3) {
      quoteWizardData.sumInsured = parseInt(document.getElementById('ws-sum-insured').value) || 1000000;
      quoteWizardData.premiumEstimate = parseInt(document.getElementById('ws-premium').value) || 12000;
    } else if (step === 5) {
      quoteWizardData.claims = parseInt(document.getElementById('ws-claims').value) || 0;
      quoteWizardData.claimsDetails = document.getElementById('ws-claims-details').value;
    }
  },

  calculateDraftRiskScore() {
    let score = 100;
    quoteWizardData.triggers = [];

    // 1. Claims impact
    const claims = quoteWizardData.claims;
    if (claims > 0) {
      const deduction = claims * 15;
      score -= deduction;
      quoteWizardData.triggers.push(`Prior Claims: Deducted ${deduction} points due to ${claims} claim(s) in last 3Y.`);
    }

    // 2. Occupancy hazard impact
    const occupancy = quoteWizardData.occupancy;
    if (occupancy === 'Chemical Processing & Storage') {
      score -= 30;
      quoteWizardData.triggers.push('Hazardous Trade: Deducted 30 points for high-hazard chemical processing operations.');
    } else if (occupancy === 'Hospitality & Leisure') {
      score -= 10;
      quoteWizardData.triggers.push('Public Access Risk: Deducted 10 points for hospitality operations.');
    }

    // 3. Accumulation threat simulation
    const lat = quoteWizardData.latitude;
    const lng = quoteWizardData.longitude;
    const distToHotzone = Math.sqrt(Math.pow(lat - 53.4682, 2) + Math.pow(lng - (-2.2592), 2)) * 111; // Approx km
    if (distToHotzone < 3) {
      score -= 15;
      quoteWizardData.triggers.push(`High Hazard Accumulation: Deducted 15 points for proximity to Manchester chemical port zone (${distToHotzone.toFixed(1)} km).`);
    }

    quoteWizardData.riskScore = Math.max(10, Math.min(100, score));

    if (quoteWizardData.riskScore >= appState.adminRules.scorePreferred) {
      quoteWizardData.riskCategory = 'Preferred';
    } else if (quoteWizardData.riskScore < appState.adminRules.scoreDeferred) {
      quoteWizardData.riskCategory = 'Deferred';
    } else {
      quoteWizardData.riskCategory = 'Referred';
    }
  },

  populateDraftScoringExplanations() {
    const list = document.getElementById('ws-rules-list');
    list.innerHTML = '';
    
    if (quoteWizardData.triggers.length === 0) {
      list.innerHTML = `<li><span class="badge badge-preferred" style="padding: 2px 6px; margin-right: 8px;">✓</span> No negative risk flags detected. Account meets Preferred Risk standards.</li>`;
    } else {
      quoteWizardData.triggers.forEach(t => {
        list.innerHTML += `<li><span class="badge badge-referred" style="padding: 2px 6px; margin-right: 8px;">!</span> ${t}</li>`;
      });
    }
  },

  populateDraftReferralRouting() {
    const roleEl = document.getElementById('ws-assignee-role');
    const reasonEl = document.getElementById('ws-routing-reason');

    const si = quoteWizardData.sumInsured;
    let target = 'junior_underwriter';

    if (si > appState.authorityLimits.senior_underwriter.limit) {
      target = 'underwriting_manager';
    } else if (si > appState.authorityLimits.underwriter.limit) {
      target = 'senior_underwriter';
    } else if (si > appState.authorityLimits.junior_underwriter.limit) {
      target = 'underwriter';
    }

    if (quoteWizardData.riskCategory === 'Deferred') {
      target = 'underwriting_manager';
    }

    const limits = appState.authorityLimits[target];
    roleEl.textContent = `${limits.name} (${target.toUpperCase().replace('_', ' ')})`;
    
    if (quoteWizardData.riskCategory === 'Deferred') {
      reasonEl.textContent = `Auto-escalation to Manager: Risk falls within DEFERRED status (Score: ${quoteWizardData.riskScore}).`;
    } else {
      reasonEl.textContent = `Routed based on Sum Insured £${si.toLocaleString()} (Authority Limit: £${limits.limit.toLocaleString()}).`;
    }
  },

  populateDraftReinsuranceScan() {
    const statusEl = document.getElementById('ws-re-status');
    const placementEl = document.getElementById('ws-re-placement');

    const si = quoteWizardData.sumInsured;
    if (si <= appState.adminRules.netRetention) {
      statusEl.textContent = 'Within Company Net Retention';
      placementEl.textContent = 'No Reinsurance required.';
    } else if (si <= appState.adminRules.netRetention + appState.adminRules.treatyCapacity) {
      statusEl.textContent = 'Treaty reinsurance capacity active';
      placementEl.textContent = `Treaty Reinsurance covers £${(si - appState.adminRules.netRetention).toLocaleString()} surplus.`;
    } else {
      statusEl.textContent = 'Exceeds Treaty capacity';
      placementEl.textContent = `Facultative placement required for £${(si - (appState.adminRules.netRetention + appState.adminRules.treatyCapacity)).toLocaleString()} limit.`;
    }
  },

  submitWizardQuote() {
    const quoteNo = `QT2024${String(appState.quotations.length + 1).padStart(3, '0')}`;
    
    const si = quoteWizardData.sumInsured;
    let assignedRole = 'underwriter';
    if (si > 5000000) assignedRole = 'underwriting_manager';
    else if (si > 2500000) assignedRole = 'senior_underwriter';

    if (quoteWizardData.riskCategory === 'Deferred') {
      assignedRole = 'underwriting_manager';
    }

    const newQuote = {
      quoteNo: quoteNo,
      customerName: quoteWizardData.customerName,
      lob: quoteWizardData.lob,
      product: quoteWizardData.product,
      sumInsured: quoteWizardData.sumInsured,
      premiumEstimate: quoteWizardData.premiumEstimate,
      occupancy: quoteWizardData.occupancy === 'Office' ? 'General Commercial Office' : quoteWizardData.occupancy,
      latitude: quoteWizardData.latitude,
      longitude: quoteWizardData.longitude,
      claims: quoteWizardData.claims,
      claimsDetails: quoteWizardData.claimsDetails || 'None reported.',
      riskScore: quoteWizardData.riskScore,
      riskCategory: quoteWizardData.riskCategory,
      slaHours: 24,
      owner: 'David Wright',
      assignedRole: assignedRole,
      status: quoteWizardData.riskCategory === 'Deferred' ? 'Deferred' : 'Underwriting Review',
      documents: [
        { name: 'Property Survey Report', uploaded: true, type: 'pdf' }
      ],
      remarks: [
        { date: '2026-06-24 16:30', user: 'Operations Admin', role: 'operations', note: 'Created new quotation via guided stepper.' }
      ],
      chatHistory: [],
      timeline: [
        { label: 'Quote Created', date: '2026-06-24 16:30', user: 'Operations Admin', status: 'completed' },
        { label: 'Risk Assessment Executed', date: '2026-06-24 16:35', user: 'System Engine', status: 'completed' },
        { label: 'Underwriting Review', date: 'In Progress', user: 'David Wright', status: 'active' }
      ]
    };

    appState.quotations.unshift(newQuote);

    // Audit logs entry
    appState.auditLogs.unshift({
      timestamp: '2026-06-24 16:30:00',
      quoteNo: quoteNo,
      user: 'Operations Admin',
      role: 'Operations',
      action: 'Created Quotation',
      transition: 'Draft -> Underwriting Review',
      remarks: `Submitted new quote for ${newQuote.customerName}. Sum Insured: £${newQuote.sumInsured.toLocaleString()}.`
    });

    appState.notifications.unshift({
      id: Date.now(),
      title: 'Quotation Created',
      desc: `${newQuote.quoteNo} submitted for ${newQuote.customerName}. Score: ${newQuote.riskScore}`,
      time: 'Just now',
      unread: true
    });

    // Reset wizard
    quoteWizardData = {
      customerName: '',
      lob: 'Property',
      product: 'Commercial Property Policy',
      sumInsured: 1000000,
      premiumEstimate: 12000,
      occupancy: 'Office',
      latitude: 53.4808,
      longitude: -2.2426,
      claims: 0,
      claimsDetails: '',
      riskScore: 100,
      riskCategory: 'Preferred',
      documents: [],
      triggers: []
    };

    this.openModal(
      'Quotation Submitted Successfully',
      `<p>Quotation <strong>${quoteNo}</strong> has been registered and routed to the <strong>${assignedRole.toUpperCase().replace('_', ' ')}</strong> work queue.</p>`,
      `<button class="btn btn-primary" onclick="app.closeModal(); app.switchView('dashboard-view');">Return to Dashboard</button>`
    );

    this.renderDashboardMetrics();
    this.renderDashboardTable();
    this.renderNotifications();
    this.renderAuditTrail();
    this.drawAccumulationMap();
  },

  // Detailed Quote Review screen rendering
  renderQuotationDetailReview(quoteNo) {
    const q = appState.quotations.find(item => item.quoteNo === quoteNo);
    if (!q) return;

    document.getElementById('detail-quote-number-breadcrumb').textContent = q.quoteNo;
    document.getElementById('detail-quote-title').textContent = `Quotation Review: ${q.customerName}`;
    
    document.getElementById('detail-cust-name').textContent = q.customerName;
    document.getElementById('detail-lob').textContent = q.lob;
    document.getElementById('detail-sum-insured').textContent = `£${q.sumInsured.toLocaleString()}`;
    document.getElementById('detail-occupancy').textContent = q.occupancy;
    document.getElementById('detail-coords').textContent = `${q.latitude.toFixed(4)}, ${q.longitude.toFixed(4)}`;
    document.getElementById('detail-claims').textContent = `${q.claims} claim(s) (${q.claimsDetails})`;
    
    const riskBadge = document.getElementById('detail-risk-badge');
    riskBadge.textContent = `${q.riskCategory} Risk`;
    riskBadge.className = 'badge';
    if (q.riskCategory === 'Preferred') riskBadge.classList.add('badge-preferred');
    else if (q.riskCategory === 'Referred') riskBadge.classList.add('badge-referred');
    else riskBadge.classList.add('badge-deferred');

    document.getElementById('detail-risk-score').textContent = q.riskScore;

    const triggersContent = document.getElementById('detail-triggers-content');
    triggersContent.innerHTML = '';
    
    const rulesList = [];
    if (q.claims > 0) rulesList.push(`Deduction for loss history: ${q.claims} claims recorded in prior years.`);
    if (q.occupancy.includes('Chemical')) rulesList.push('High hazard occupancy classification (Chemical storage).');
    if (q.sumInsured > 5000000) rulesList.push('High value sum insured referral: exceeds underwriter limits.');

    if (rulesList.length === 0) {
      triggersContent.innerHTML = `
        <div style="background-color: var(--risk-preferred-bg); color: var(--risk-preferred-text); padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.8rem;">
          <i data-lucide="check-circle" style="vertical-align: middle; margin-right: 6px; width: 14px; height: 14px; display: inline-block;"></i> Quotation passes all standard automatic validation filters. No referral codes flagged.
        </div>
      `;
    } else {
      let html = '<ul style="font-size: 0.8rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px; padding-left: 16px;">';
      rulesList.forEach(r => {
        html += `<li>${r}</li>`;
      });
      html += '</ul>';
      triggersContent.innerHTML = html;
    }

    // Reinsurance Recommendation Card rendering
    const reBadge = document.getElementById('detail-reinsurance-badge');
    const requiredReText = document.getElementById('detail-required-re');
    const placementSuggText = document.getElementById('detail-placement-sugg');
    const riFlowBox = document.getElementById('detail-ri-flow');

    if (q.sumInsured <= appState.adminRules.netRetention) {
      reBadge.textContent = 'Retention Met';
      reBadge.className = 'badge badge-preferred';
      requiredReText.textContent = 'None (£0)';
      placementSuggText.textContent = 'Keep 100% net exposure within company retention.';
      riFlowBox.style.display = 'none';
    } else {
      reBadge.textContent = q.sumInsured > 6000000 ? 'Facultative Required' : 'Treaty Reinsurance';
      reBadge.className = q.sumInsured > 6000000 ? 'badge badge-deferred' : 'badge badge-referred';
      
      const reqRe = q.sumInsured - appState.adminRules.netRetention;
      requiredReText.textContent = `£${reqRe.toLocaleString()}`;
      
      if (q.sumInsured > 6000000) {
        placementSuggText.textContent = 'Requires manual facultative placement with external reinsurance panel.';
      } else {
        placementSuggText.textContent = 'Auto-allocated to Surplus Treaty Agreement.';
      }
      
      riFlowBox.style.display = 'flex';
      riFlowBox.innerHTML = `
        <div class="ri-node">
          <h5>Net Retention</h5>
          <p>£1,000,000</p>
        </div>
        <div class="ri-arrow"></div>
        <div class="ri-node" style="border-color: var(--risk-referred);">
          <h5>Treaty Pool</h5>
          <p>£${Math.min(reqRe, 5000000).toLocaleString()}</p>
        </div>
        ${reqRe > 5000000 ? `
          <div class="ri-arrow"></div>
          <div class="ri-node" style="border-color: var(--risk-deferred);">
            <h5>Facultative</h5>
            <p>£${(reqRe - 5000000).toLocaleString()}</p>
          </div>
        ` : ''}
      `;
    }

    // Underwriting Authority Escalation info
    const routingInfo = document.getElementById('detail-routing-info');
    let requiredRoleName = 'Underwriter';
    if (q.sumInsured > 5000000) requiredRoleName = 'Underwriting Manager';
    else if (q.sumInsured > 2500000) requiredRoleName = 'Senior Underwriter';

    routingInfo.innerHTML = `
      <div>
        <p style="color: var(--text-muted); margin-bottom: 2px;">Assigned Review Level:</p>
        <p style="font-weight: 600;"><i data-lucide="user-check" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></i> ${requiredRoleName}</p>
      </div>
      <div>
        <p style="color: var(--text-muted); margin-bottom: 2px;">Referral Authority Reason:</p>
        <p style="font-weight: 500;">${q.sumInsured > 2500000 ? `Exceeds basic Underwriter threshold limit of £2.5M.` : `Within basic Underwriter limits.`}</p>
      </div>
    `;

    // Render Checklist documents
    const docChecklist = document.getElementById('detail-docs-checklist');
    docChecklist.innerHTML = '';
    q.documents.forEach(d => {
      docChecklist.innerHTML += `
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; padding: 5px 8px; background-color: var(--bg-app); border-radius: var(--radius-sm);">
          <span><i data-lucide="file" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 6px; color: var(--text-muted);"></i> ${d.name}</span>
          ${d.uploaded ? `<span style="color: var(--risk-preferred-text); font-weight: 600;">Uploaded</span>` : `<button class="btn btn-secondary btn-sm" style="padding: 2px 6px; font-size: 0.65rem;" onclick="app.simulateDocUpload('${q.quoteNo}', '${d.name}')">Upload</button>`}
        </div>
      `;
    });

    // Dynamic Actions Panel Button layout
    const btnBox = document.getElementById('detail-action-buttons-box');
    const role = appState.currentRole;
    
    btnBox.innerHTML = '';
    
    if (role === 'agent') {
      document.getElementById('detail-decision-actions-panel').style.display = 'none';
    } else {
      document.getElementById('detail-decision-actions-panel').style.display = 'block';
      
      let hasAuthority = false;
      if (role === 'admin') hasAuthority = true;
      else if (role === 'reinsurance_manager') hasAuthority = true;
      else if (role === 'underwriting_manager') hasAuthority = true;
      else if (role === 'senior_underwriter' && q.sumInsured <= 5000000) hasAuthority = true;
      else if (role === 'underwriter' && q.sumInsured <= 2500000) hasAuthority = true;

      if (hasAuthority) {
        btnBox.innerHTML = `
          <button class="btn btn-success" onclick="app.executeDecision('Approve')"><i data-lucide="check"></i> Approve & Issue</button>
          <button class="btn btn-danger" onclick="app.executeDecision('Decline')"><i data-lucide="x"></i> Decline Risk</button>
          <button class="btn btn-secondary" onclick="app.executeDecision('Defer')"><i data-lucide="clock"></i> Defer decision</button>
          <button class="btn btn-warning" onclick="app.executeDecision('Refer')"><i data-lucide="share-2"></i> Refer up Hierarchy</button>
        `;
      } else {
        btnBox.innerHTML = `
          <div style="background-color: var(--risk-referred-bg); color: var(--risk-referred-text); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.78rem; font-weight: 500; margin-bottom: 6px; border-left: 3px solid var(--risk-referred);">
            <i data-lucide="info" style="width: 12px; height: 12px; vertical-align: middle;"></i> Sum Insured exceeds your role authority limit. Please refer.
          </div>
          <button class="btn btn-warning" onclick="app.executeDecision('Refer')"><i data-lucide="share-2"></i> Refer up Hierarchy</button>
          <button class="btn btn-secondary" onclick="app.executeDecision('Defer')"><i data-lucide="clock"></i> Defer decision</button>
        `;
      }
    }

    this.renderChatHistory(q);
    this.renderTimelineTracker(q);

    const timerText = document.getElementById('detail-sla-timer-text');
    const escalationTarget = document.getElementById('detail-sla-escalation-target');
    if (q.slaHours === 0) {
      timerText.textContent = 'RESOLVED';
      timerText.style.color = 'var(--risk-preferred)';
      escalationTarget.textContent = 'Workflow finished.';
    } else {
      timerText.textContent = `${q.slaHours}h 00m`;
      timerText.style.color = q.slaHours <= 12 ? 'var(--risk-deferred)' : 'var(--primary)';
      escalationTarget.textContent = q.slaHours <= 12 ? 'Escalating immediately to Manager' : `Target queue: ${requiredRoleName}`;
    }

    const banner = document.getElementById('detail-alert-banner');
    banner.style.display = 'none';
    if (q.riskCategory === 'Deferred') {
      banner.style.display = 'block';
      banner.innerHTML = `
        <div style="background-color: var(--risk-deferred-bg); border: 1px solid var(--risk-deferred); color: var(--risk-deferred-text); padding: 10px 16px; border-radius: var(--radius-md); font-size: 0.8rem; font-weight: 500; display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <i data-lucide="alert-octagon"></i> <strong>Critical Warning:</strong> This account belongs to the DEFERRED risk category and cannot proceed to binding until additional details are completed or reinsurance capacity overrides are approved.
        </div>
      `;
    }

    lucide.createIcons();
  },

  renderChatHistory(q) {
    const chatHistoryBox = document.getElementById('detail-chat-history');
    chatHistoryBox.innerHTML = '';

    if (q.chatHistory.length === 0) {
      chatHistoryBox.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 0.78rem; padding: 24px;">No messages sent. Start communication with the agent.</p>`;
      return;
    }

    q.chatHistory.forEach(msg => {
      const bubble = document.createElement('div');
      const isSent = msg.sender === 'underwriter';
      bubble.className = `chat-bubble ${isSent ? 'sent' : 'received'}`;
      bubble.innerHTML = `
        ${msg.text}
        <span class="chat-bubble-meta">${msg.sender.toUpperCase()} - ${msg.time}</span>
      `;
      chatHistoryBox.appendChild(bubble);
    });

    chatHistoryBox.scrollTop = chatHistoryBox.scrollHeight;
  },

  sendChatFromDetail() {
    const input = document.getElementById('detail-chat-input');
    const val = input.value.trim();
    if (!val) return;

    const q = appState.quotations.find(item => item.quoteNo === appState.selectedQuoteNo);
    if (!q) return;

    q.chatHistory.push({
      sender: 'underwriter',
      text: val,
      time: '2026-06-24 16:45'
    });

    input.value = '';
    this.renderChatHistory(q);

    // Simulate Agent Auto-response
    setTimeout(() => {
      q.chatHistory.push({
        sender: 'agent',
        text: 'Received your request. Checking with the client representative and will upload files shortly.',
        time: '2026-06-24 16:46'
      });
      this.renderChatHistory(q);
      this.renderNotifications();
      lucide.createIcons();
    }, 2000);
  },

  simulateDocUpload(quoteNo, docName) {
    const q = appState.quotations.find(item => item.quoteNo === quoteNo);
    if (!q) return;
    const doc = q.documents.find(d => d.name === docName);
    if (doc) doc.uploaded = true;

    appState.auditLogs.unshift({
      timestamp: '2026-06-24 16:45:00',
      quoteNo: quoteNo,
      user: 'Agent Intermediary',
      role: 'Agent',
      action: 'Upload document',
      transition: 'Active',
      remarks: `Uploaded requested document: ${docName}.`
    });

    this.renderQuotationDetailReview(quoteNo);
    this.renderAuditTrail();
  },

  renderTimelineTracker(q) {
    const timelineBox = document.getElementById('detail-progress-timeline');
    timelineBox.innerHTML = '';

    q.timeline.forEach(step => {
      const isCompleted = step.status === 'completed';
      const isActive = step.status === 'active';
      const isBreached = step.status === 'breached';

      const li = document.createElement('li');
      li.className = `timeline-event ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isBreached ? 'breached' : ''}`;
      
      li.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-meta">${step.date} • ${step.user}</div>
        <div class="timeline-event-title">${step.label}</div>
      `;
      timelineBox.appendChild(li);
    });
  },

  executeDecision(decisionType) {
    const q = appState.quotations.find(item => item.quoteNo === appState.selectedQuoteNo);
    if (!q) return;

    const remarksVal = document.getElementById('detail-remarks-input').value || 'Processed decision.';
    const loadingVal = document.getElementById('detail-loading-input').value || '0';

    let nextStatus = '';
    let role = appState.currentRole;

    if (decisionType === 'Approve') {
      nextStatus = 'Quote Issued';
      q.slaHours = 0;
    } else if (decisionType === 'Decline') {
      nextStatus = 'Declined';
      q.slaHours = 0;
    } else if (decisionType === 'Defer') {
      nextStatus = 'Deferred';
    } else if (decisionType === 'Refer') {
      if (role === 'underwriter') {
        q.assignedRole = 'senior_underwriter';
        nextStatus = 'Senior Approval Pending';
      } else if (role === 'senior_underwriter') {
        q.assignedRole = 'underwriting_manager';
        nextStatus = 'Manager Referral Pending';
      } else {
        q.assignedRole = 'reinsurance_manager';
        nextStatus = 'Reinsurance Review';
      }
    }

    q.status = nextStatus;
    
    const activePersona = appState.personas.find(p => p.key === role) || { name: 'Underwriter' };
    const activeUserName = activePersona.name;

    q.remarks.unshift({
      date: '2026-06-24 16:50',
      user: activeUserName,
      role: role,
      note: `${decisionType} decision logged. Loading: ${loadingVal}%. Note: ${remarksVal}`
    });

    q.timeline.unshift({
      label: `Underwriter Decision: ${decisionType}`,
      date: '2026-06-24 16:50',
      user: activeUserName,
      status: 'completed'
    });

    appState.auditLogs.unshift({
      timestamp: '2026-06-24 16:50:00',
      quoteNo: q.quoteNo,
      user: activeUserName,
      role: role,
      action: `Decision - ${decisionType}`,
      transition: `${q.status} -> ${nextStatus}`,
      remarks: remarksVal
    });

    document.getElementById('detail-remarks-input').value = '';

    this.openModal(
      'Decision Saved',
      `<p>Quotation <strong>${q.quoteNo}</strong> status updated to: <strong>${nextStatus}</strong>.</p>`,
      `<button class="btn btn-primary" onclick="app.closeModal(); app.switchView('work-queue-view');">Return to Queue</button>`
    );

    this.renderDashboardMetrics();
    this.renderDashboardTable();
    this.renderWorkQueueTable();
    this.renderAuditTrail();
  },

  // Interactive geospatial canvas map drawer (Refined Dark Theme Look)
  startMapAnimation() {
    this.stopMapAnimation();
    this.mapSweepAngle = this.mapSweepAngle || 0;
    this.mapEventsInitialized = this.mapEventsInitialized || false;
    
    const canvas = document.getElementById('map-canvas');
    if (canvas && !this.mapEventsInitialized) {
      this.initMapEvents(canvas);
    }
    
    const animate = () => {
      this.mapSweepAngle += 0.012;
      if (this.mapSweepAngle > Math.PI * 2) {
        this.mapSweepAngle = 0;
      }
      this.drawAccumulationMap();
      if (appState.activeView === 'risk-map-view') {
        this.mapAnimId = requestAnimationFrame(animate);
      }
    };
    this.mapAnimId = requestAnimationFrame(animate);
  },

  stopMapAnimation() {
    if (this.mapAnimId) {
      cancelAnimationFrame(this.mapAnimId);
      this.mapAnimId = null;
    }
  },

  initMapEvents(canvas) {
    this.mapEventsInitialized = true;
    this.mousePos = { x: null, y: null };
    this.hoveredQuote = null;

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.mousePos.x = (e.clientX - rect.left) * scaleX;
      this.mousePos.y = (e.clientY - rect.top) * scaleY;

      const centerLat = 53.4808;
      const centerLng = -2.2426;
      const mapWidth = canvas.width;
      const mapHeight = canvas.height;
      const latToY = (lat) => mapHeight / 2 - (lat - centerLat) * 3500;
      const lngToX = (lng) => mapWidth / 2 + (lng - centerLng) * 5500;

      let found = null;
      appState.quotations.forEach(q => {
        if (q.quoteNo === 'QT2024004' && q.latitude === 51.5074) return; // Skip London
        const px = lngToX(q.longitude);
        const py = latToY(q.latitude);
        const dist = Math.sqrt(Math.pow(this.mousePos.x - px, 2) + Math.pow(this.mousePos.y - py, 2));
        if (dist <= 12) {
          found = q;
        }
      });
      this.hoveredQuote = found;

      if (!this.mapAnimId) {
        this.drawAccumulationMap();
      }
    });

    canvas.addEventListener('mouseleave', () => {
      this.mousePos = { x: null, y: null };
      this.hoveredQuote = null;
      if (!this.mapAnimId) {
        this.drawAccumulationMap();
      }
    });

    canvas.addEventListener('click', () => {
      if (this.hoveredQuote) {
        appState.selectedQuoteNo = this.hoveredQuote.quoteNo;
        if (!this.mapAnimId) {
          this.drawAccumulationMap();
        }
      }
    });
  },

  drawAccumulationMap() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const centerLat = 53.4808;
    const centerLng = -2.2426;
    
    const mapWidth = canvas.width;
    const mapHeight = canvas.height;
    
    // Set custom background based on active theme
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, mapWidth, mapHeight);
    
    // Draw sci-fi style grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < mapWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mapHeight);
      ctx.stroke();
    }
    for (let y = 0; y < mapHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(mapWidth, y);
      ctx.stroke();
    }

    // Draw realistic River Irwell winding path
    ctx.save();
    ctx.strokeStyle = 'rgba(20, 110, 185, 0.15)';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-50, 220);
    ctx.bezierCurveTo(200, 180, 220, 380, 480, 290);
    ctx.bezierCurveTo(620, 250, 680, 390, 850, 360);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // River label
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.font = 'italic 500 9px monospace';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(350, 315);
    ctx.rotate(-0.18);
    ctx.fillText('RIVER IRWELL', 0, 0);
    ctx.restore();

    // Draw District Borders
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.setLineDash([3, 5]);
    ctx.lineWidth = 1.2;

    // Sector 1: Salford
    ctx.fillStyle = 'rgba(255, 255, 255, 0.008)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(340, 0);
    ctx.lineTo(260, 240);
    ctx.lineTo(0, 200);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sector 2: City Centre
    ctx.fillStyle = 'rgba(56, 189, 248, 0.006)';
    ctx.beginPath();
    ctx.moveTo(340, 0);
    ctx.lineTo(800, 0);
    ctx.lineTo(800, 280);
    ctx.lineTo(500, 320);
    ctx.lineTo(260, 240);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sector 3: Castlefield / Hulme
    ctx.fillStyle = 'rgba(255, 255, 255, 0.008)';
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(260, 240);
    ctx.lineTo(500, 320);
    ctx.lineTo(440, 500);
    ctx.lineTo(0, 500);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // District Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.font = '900 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SALFORD WARD', 110, 80);
    ctx.fillText('MANCHESTER CITY CENTRE', 540, 110);
    ctx.fillText('CASTLEFIELD', 210, 420);
    ctx.fillText('PICCADILLY', 720, 240);

    // Draw Major Roads
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.beginPath();
    ctx.moveTo(380, 0);
    ctx.lineTo(380, 500);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 340);
    ctx.lineTo(800, 340);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.font = '500 7px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('A56 DEANSGATE', 386, 40);
    ctx.fillText('A57 REGENT RD', 15, 335);

    // Draw multi-risk Catastrophe flood zone layers
    // High Hazard (Zone 3)
    const zone3Pts = [[140, 180], [380, 220], [490, 410], [270, 460]];
    ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(zone3Pts[0][0], zone3Pts[0][1]);
    for(let i = 1; i < zone3Pts.length; i++) ctx.lineTo(zone3Pts[i][0], zone3Pts[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hatch pattern in Zone 3
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(zone3Pts[0][0], zone3Pts[0][1]);
    for(let i = 1; i < zone3Pts.length; i++) ctx.lineTo(zone3Pts[i][0], zone3Pts[i][1]);
    ctx.closePath();
    ctx.clip();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.lineWidth = 0.8;
    for (let offset = -400; offset < 900; offset += 15) {
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset + 500, 500);
      ctx.stroke();
    }
    ctx.restore();

    // Medium Hazard (Zone 2)
    const zone2Pts = [[110, 160], [410, 200], [530, 440], [240, 490]];
    ctx.fillStyle = 'rgba(249, 115, 22, 0.05)';
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(zone2Pts[0][0], zone2Pts[0][1]);
    for(let i = 1; i < zone2Pts.length; i++) ctx.lineTo(zone2Pts[i][0], zone2Pts[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Low Hazard (Zone 1)
    const zone1Pts = [[80, 130], [440, 170], [570, 470], [210, 510]];
    ctx.fillStyle = 'rgba(234, 179, 8, 0.02)';
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.1)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(zone1Pts[0][0], zone1Pts[0][1]);
    for(let i = 1; i < zone1Pts.length; i++) ctx.lineTo(zone1Pts[i][0], zone1Pts[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(239, 68, 68, 0.65)';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('▲ CAT-3 FLOOD ZONE', 155, 196);

    const quotes = appState.quotations;
    const latToY = (lat) => mapHeight / 2 - (lat - centerLat) * 3500;
    const lngToX = (lng) => mapWidth / 2 + (lng - centerLng) * 5500;

    const radiusScale = document.getElementById('map-radius-selector') ? parseFloat(document.getElementById('map-radius-selector').value) : 5;
    const radiusPx = radiusScale * 14;
    
    const centerX = lngToX(centerLng);
    const centerY = latToY(centerLat);

    // Draw compass rose
    ctx.save();
    const compX = mapWidth - 45;
    const compY = 45;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(compX, compY, 20, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(compX - 25, compY);
    ctx.lineTo(compX + 25, compY);
    ctx.moveTo(compX, compY - 25);
    ctx.lineTo(compX, compY + 25);
    ctx.stroke();

    ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.beginPath();
    ctx.moveTo(compX, compY - 18);
    ctx.lineTo(compX - 5, compY - 3);
    ctx.lineTo(compX, compY - 6);
    ctx.lineTo(compX + 5, compY - 3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', compX, compY - 22);
    ctx.restore();

    // Scale bar
    ctx.save();
    const scX = mapWidth - 110;
    const scY = mapHeight - 30;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scX, scY);
    ctx.lineTo(scX + 70, scY);
    ctx.moveTo(scX, scY - 4);
    ctx.lineTo(scX, scY + 2);
    ctx.moveTo(scX + 35, scY - 4);
    ctx.lineTo(scX + 35, scY + 2);
    ctx.moveTo(scX + 70, scY - 4);
    ctx.lineTo(scX + 70, scY + 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0', scX, scY - 8);
    ctx.fillText('2.5 km', scX + 35, scY - 8);
    ctx.fillText('5 km', scX + 70, scY - 8);
    ctx.restore();

    // Border Axis Ticks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    const pad = 20;
    ctx.strokeRect(pad, pad, mapWidth - pad * 2, mapHeight - pad * 2);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '7px monospace';
    for (let y = 60; y < mapHeight - pad; y += 80) {
      const latVal = centerLat + (mapHeight / 2 - y) / 3500;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(pad + 4, y);
      ctx.stroke();
      ctx.textAlign = 'left';
      ctx.fillText(`${latVal.toFixed(4)}°N`, pad + 6, y + 2.5);
    }
    for (let x = 80; x < mapWidth - pad; x += 120) {
      const lngVal = centerLng + (x - mapWidth / 2) / 5500;
      ctx.beginPath();
      ctx.moveTo(x, mapHeight - pad);
      ctx.lineTo(x, mapHeight - pad - 4);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillText(`${lngVal.toFixed(4)}°W`, x, mapHeight - pad - 6);
    }

    // Draw main accumulation circle
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.02)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radiusPx, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // concentric inner circles
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radiusPx * 0.5, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, radiusPx * 0.25, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshair at center
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(centerX - 8, centerY);
    ctx.lineTo(centerX + 8, centerY);
    ctx.moveTo(centerX, centerY - 8);
    ctx.lineTo(centerX, centerY + 8);
    ctx.stroke();

    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.fillRect(centerX - 42, centerY - radiusPx - 24, 84, 17);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(centerX - 42, centerY - radiusPx - 24, 84, 17);
    ctx.fillStyle = '#fff';
    ctx.font = '600 8.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`ZONE: ${radiusScale}km`, centerX, centerY - radiusPx - 12);

    // Sonar sweep rotation animation
    if (this.mapSweepAngle !== undefined) {
      const sweepRadius = radiusPx * 1.4;
      const sweepX = centerX + Math.cos(this.mapSweepAngle) * sweepRadius;
      const sweepY = centerY + Math.sin(this.mapSweepAngle) * sweepRadius;

      ctx.save();
      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sweepRadius);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      const steps = 30;
      for (let i = 0; i <= steps; i++) {
        const angle = this.mapSweepAngle - (i / steps) * 0.6;
        ctx.lineTo(centerX + Math.cos(angle) * sweepRadius, centerY + Math.sin(angle) * sweepRadius);
      }
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();
      ctx.restore();
    }

    let insideExposure = 0;
    let count = 0;

    // Draw connection lines first so they are under the nodes
    quotes.forEach(q => {
      if (q.quoteNo === 'QT2024004' && q.latitude === 51.5074) return;
      const px = lngToX(q.longitude);
      const py = latToY(q.latitude);
      const dist = Math.sqrt(Math.pow(q.latitude - centerLat, 2) + Math.pow(q.longitude - centerLng, 2)) * 111;
      const isInside = dist <= radiusScale;

      if (isInside) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw points & labels
    quotes.forEach(q => {
      if (q.quoteNo === 'QT2024004' && q.latitude === 51.5074) return;
      const px = lngToX(q.longitude);
      const py = latToY(q.latitude);

      const dist = Math.sqrt(Math.pow(q.latitude - centerLat, 2) + Math.pow(q.longitude - centerLng, 2)) * 111;
      const isInside = dist <= radiusScale;

      if (isInside) {
        insideExposure += q.sumInsured;
        count++;
      }

      let pointColor = '#10b981';
      let colorRGB = '16, 185, 129';
      if (q.riskCategory === 'Referred') { pointColor = '#f59e0b'; colorRGB = '245, 158, 11'; }
      if (q.riskCategory === 'Deferred') { pointColor = '#ef4444'; colorRGB = '239, 68, 68'; }

      const isSelected = q.quoteNo === appState.selectedQuoteNo;
      const isHovered = this.hoveredQuote && q.quoteNo === this.hoveredQuote.quoteNo;

      if (isSelected || isHovered) {
        const t = Date.now() / 1000;
        const radiusMultiplier = 1.0 + (t % 1.5) / 1.5;
        const opacity = 1.0 - (t % 1.5) / 1.5;

        ctx.strokeStyle = `rgba(${colorRGB}, ${opacity * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, 7 * radiusMultiplier * 1.8, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${colorRGB}, ${opacity * 0.4})`;
        ctx.beginPath();
        ctx.arc(px, py, 7 * radiusMultiplier * 2.8, 0, 2 * Math.PI);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(px, py, 6, 0, 2 * Math.PI);
      ctx.fillStyle = pointColor;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      // Shadowed text labels
      ctx.font = '600 9.5px sans-serif';
      const labelText = q.customerName;
      const textWidth = ctx.measureText(labelText).width;
      
      ctx.fillStyle = 'rgba(11, 15, 25, 0.75)';
      ctx.fillRect(px + 10, py - 8, textWidth + 6, 14);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 10, py - 8, textWidth + 6, 14);

      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText(labelText, px + 13, py + 2);
    });

    // Crosshair guidelines for mouse
    if (this.mousePos && this.mousePos.x !== null) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 4]);

      ctx.beginPath();
      ctx.moveTo(this.mousePos.x, pad);
      ctx.lineTo(this.mousePos.x, mapHeight - pad);
      ctx.moveTo(pad, this.mousePos.y);
      ctx.lineTo(mapWidth - pad, this.mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const mouseLat = centerLat + (mapHeight / 2 - this.mousePos.y) / 3500;
      const mouseLng = centerLng + (this.mousePos.x - mapWidth / 2) / 5500;
      
      ctx.fillStyle = 'rgba(11, 15, 25, 0.9)';
      ctx.fillRect(32, mapHeight - 48, 145, 22);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(32, mapHeight - 48, 145, 22);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '500 8.5px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`GRID: ${mouseLat.toFixed(5)}N, ${Math.abs(mouseLng).toFixed(5)}W`, 38, mapHeight - 34);
    }

    // Hover Tooltip on Canvas
    if (this.hoveredQuote) {
      const q = this.hoveredQuote;
      const px = lngToX(q.longitude);
      const py = latToY(q.latitude);

      const ttW = 160;
      const ttH = 92;
      let ttX = px + 15;
      let ttY = py - ttH - 15;
      if (ttX + ttW > mapWidth - pad) ttX = px - ttW - 15;
      if (ttY < pad) ttY = py + 15;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(ttX, ttY, ttW, ttH, 6);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      
      let borderStyle = 'rgba(16, 185, 129, 0.5)';
      if (q.riskCategory === 'Referred') borderStyle = 'rgba(245, 158, 11, 0.5)';
      if (q.riskCategory === 'Deferred') borderStyle = 'rgba(239, 68, 68, 0.5)';
      
      ctx.strokeStyle = borderStyle;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(q.customerName.toUpperCase(), ttX + 10, ttY + 16);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ttX + 10, ttY + 24);
      ctx.lineTo(ttX + ttW - 10, ttY + 24);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '8px sans-serif';
      ctx.fillText('LOB / Product:', ttX + 10, ttY + 38);
      ctx.fillText('Sum Insured:', ttX + 10, ttY + 52);
      ctx.fillText('Risk Category:', ttX + 10, ttY + 66);
      ctx.fillText('Coordinates:', ttX + 10, ttY + 80);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(q.lob + ' / ' + q.product, ttX + ttW - 10, ttY + 38);
      ctx.fillText(`£${q.sumInsured.toLocaleString()}`, ttX + ttW - 10, ttY + 52);
      
      ctx.fillStyle = q.riskCategory === 'Deferred' ? '#ef4444' : q.riskCategory === 'Referred' ? '#f59e0b' : '#10b981';
      ctx.fillText(q.riskCategory, ttX + ttW - 10, ttY + 66);
      
      ctx.fillStyle = '#fff';
      ctx.font = '8px monospace';
      ctx.fillText(`${q.latitude.toFixed(4)}, ${q.longitude.toFixed(4)}`, ttX + ttW - 10, ttY + 80);

      ctx.restore();
    }

    document.getElementById('map-overlay-count').textContent = count;
    document.getElementById('map-overlay-exposure').textContent = `£${insideExposure.toLocaleString()}`;
    
    const maxCap = appState.adminRules.maxCapacity;
    const capacityPercent = Math.round((insideExposure / maxCap) * 100);
    document.getElementById('map-overlay-capacity-percent').textContent = `${capacityPercent}%`;
    document.getElementById('map-overlay-capacity-bar').style.width = `${Math.min(capacityPercent, 100)}%`;

    const fill = document.getElementById('map-overlay-capacity-bar');
    if (capacityPercent > 80) fill.style.background = 'var(--risk-deferred)';
    else if (capacityPercent > 50) fill.style.background = 'var(--risk-referred)';
    else fill.style.background = 'var(--risk-preferred)';

    document.getElementById('map-metrics-exposure').textContent = `£${insideExposure.toLocaleString()}`;
    document.getElementById('map-metrics-avail').textContent = `£${Math.max(0, maxCap - insideExposure).toLocaleString()}`;
    document.getElementById('map-metrics-breach-risk').textContent = `${capacityPercent}%`;
  },

  changeMapRadius(radiusVal) {
    this.drawAccumulationMap();
  },

  // Authority Limits Setup Admin View
  renderAuthorityMatrix() {
    const grid = document.getElementById('authority-matrix-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.entries(appState.authorityLimits).forEach(([key, limits]) => {
      const card = document.createElement('div');
      card.className = 'role-limit-card';
      card.innerHTML = `
        <h4><span><i data-lucide="shield-check" style="vertical-align: middle; margin-right: 6px;"></i> ${limits.name}</span></h4>
        <div class="limit-item">
          <span>Max Sum Insured limit:</span>
          <span>£${limits.limit.toLocaleString()}</span>
        </div>
        <div class="limit-item">
          <span>Premium Cap Threshold:</span>
          <span>£${limits.premiumLimit.toLocaleString()}</span>
        </div>
        <div class="limit-item">
          <span>Authority LOB Products:</span>
          <span style="font-size: 0.75rem;">${limits.products.join(', ')}</span>
        </div>
        <div style="margin-top: 14px;">
          <button class="btn btn-secondary btn-sm w-full" onclick="app.editAuthorityLimit('${key}')">Edit Limits</button>
        </div>
      `;
      grid.appendChild(card);
    });

    lucide.createIcons();
  },

  editAuthorityLimit(roleKey) {
    const limitInfo = appState.authorityLimits[roleKey];
    this.openModal(
      `Edit Limits - ${limitInfo.name}`,
      `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="form-field">
            <label>Authority Sum Insured Limit (£)</label>
            <input type="number" class="form-input" id="edit-limit-si" value="${limitInfo.limit}">
          </div>
          <div class="form-field">
            <label>Premium Threshold Limit (£)</label>
            <input type="number" class="form-input" id="edit-limit-prem" value="${limitInfo.premiumLimit}">
          </div>
        </div>
      `,
      `
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.saveAuthorityLimit('${roleKey}')">Save Changes</button>
      `
    );
  },

  saveAuthorityLimit(roleKey) {
    const newSI = parseInt(document.getElementById('edit-limit-si').value);
    const newPrem = parseInt(document.getElementById('edit-limit-prem').value);

    appState.authorityLimits[roleKey].limit = newSI;
    appState.authorityLimits[roleKey].premiumLimit = newPrem;

    this.closeModal();
    this.renderAuthorityMatrix();
  },

  // Admin Config settings
  loadAdminConfigValues() {
    document.getElementById('cfg-score-preferred').value = appState.adminRules.scorePreferred;
    document.getElementById('cfg-score-deferred').value = appState.adminRules.scoreDeferred;
    document.getElementById('cfg-max-claims').value = appState.adminRules.maxClaims;
    document.getElementById('cfg-accum-radius').value = appState.adminRules.accumRadius;
    document.getElementById('cfg-max-capacity').value = appState.adminRules.maxCapacity;
  },

  saveAdminRules() {
    appState.adminRules.scorePreferred = parseInt(document.getElementById('cfg-score-preferred').value);
    appState.adminRules.scoreDeferred = parseInt(document.getElementById('cfg-score-deferred').value);
    appState.adminRules.maxClaims = parseInt(document.getElementById('cfg-max-claims').value);
    appState.adminRules.accumRadius = parseInt(document.getElementById('cfg-accum-radius').value);
    appState.adminRules.maxCapacity = parseInt(document.getElementById('cfg-max-capacity').value);

    this.openModal(
      'Configuration Saved',
      '<p>Global scoring parameters, perils zones limits, and branch capacities updated successfully.</p>',
      '<button class="btn btn-primary" onclick="app.closeModal()">Close</button>'
    );
  },

  // Audit Log history
  renderAuditTrail() {
    const tbody = document.getElementById('audit-trail-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    appState.auditLogs.forEach(log => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-size: 0.8rem; color: var(--text-muted);">${log.timestamp}</td>
        <td style="font-weight: 700; color: var(--primary);">${log.quoteNo}</td>
        <td><span style="font-weight: 600;">${log.user}</span> <span style="font-size: 0.75rem; color: var(--text-muted);">(${log.role})</span></td>
        <td style="font-weight: 500;">${log.action}</td>
        <td><span class="badge badge-pending" style="font-size: 0.7rem;">${log.transition}</span></td>
        <td style="font-size: 0.85rem; color: var(--text-secondary); max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${log.remarks}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  // Notifications drawer panel
  renderNotifications() {
    const listContainer = document.getElementById('notifications-list');
    const badge = document.getElementById('notif-badge');
    listContainer.innerHTML = '';

    const unreadCount = appState.notifications.filter(n => n.unread).length;
    if (unreadCount > 0) {
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }

    appState.notifications.forEach(n => {
      const div = document.createElement('div');
      div.className = `notification-item ${n.unread ? 'unread' : ''}`;
      div.innerHTML = `
        <h5>${n.title}</h5>
        <p>${n.desc}</p>
        <div class="time"><i data-lucide="clock" style="width: 10px; height: 10px; vertical-align: middle; margin-right: 4px;"></i> ${n.time}</div>
      `;
      div.addEventListener('click', () => {
        n.unread = false;
        this.renderNotifications();
      });
      listContainer.appendChild(div);
    });

    lucide.createIcons();
  },

  clearUnreadNotificationsBadge() {
    appState.notifications.forEach(n => n.unread = false);
    this.renderNotifications();
  },

  goBackToQueue() {
    this.switchView('work-queue-view');
  },

  // Reusable Modal Methods
  openModal(title, bodyHTML, footerHTML) {
    const modal = document.getElementById('app-modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-footer').innerHTML = footerHTML;
    modal.classList.add('open');
  },

  closeModal() {
    const modal = document.getElementById('app-modal');
    modal.classList.remove('open');
  },

  // Custom Dropdown UI Initialization
  initCustomDropdowns() {
    document.querySelectorAll('select.filter-select, select.form-select').forEach(select => {
      this.createCustomDropdown(select);
    });

    // Global click listener to close dropdowns when clicking outside
    document.removeEventListener('click', this.closeAllCustomDropdowns);
    document.addEventListener('click', this.closeAllCustomDropdowns);
  },

  closeAllCustomDropdowns() {
    document.querySelectorAll('.custom-dropdown-container').forEach(c => {
      c.classList.remove('open');
    });
  },

  createCustomDropdown(selectElement) {
    // Hide native select
    selectElement.style.display = 'none';

    // Find and remove any existing custom dropdown for this select element
    const parent = selectElement.parentNode;
    const existing = parent.querySelector('.custom-dropdown-container');
    if (existing) {
      existing.remove();
    }

    // Build container
    const container = document.createElement('div');
    container.className = 'custom-dropdown-container';
    if (selectElement.style.width) {
      container.style.width = selectElement.style.width;
    }

    // Build trigger
    const trigger = document.createElement('div');
    trigger.className = 'custom-dropdown-trigger';

    const selectedSpan = document.createElement('span');
    selectedSpan.className = 'custom-dropdown-selected-value';

    // Get current selection
    const activeOption = selectElement.options[selectElement.selectedIndex] || selectElement.options[0];
    selectedSpan.textContent = activeOption ? activeOption.textContent : '';

    const arrow = document.createElement('i');
    arrow.className = 'custom-dropdown-arrow';
    arrow.setAttribute('data-lucide', 'chevron-down');

    trigger.appendChild(selectedSpan);
    trigger.appendChild(arrow);
    container.appendChild(trigger);

    // Build menu
    const menu = document.createElement('div');
    menu.className = 'custom-dropdown-menu';

    Array.from(selectElement.options).forEach(opt => {
      const item = document.createElement('div');
      item.className = 'custom-dropdown-item';
      if (opt.value === selectElement.value) {
        item.classList.add('selected');
      }
      item.textContent = opt.textContent;
      item.setAttribute('data-value', opt.value);

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        selectElement.value = opt.value;
        selectedSpan.textContent = opt.textContent;

        menu.querySelectorAll('.custom-dropdown-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        container.classList.remove('open');

        // Fire native change listener
        selectElement.dispatchEvent(new Event('change'));
      });

      menu.appendChild(item);
    });

    container.appendChild(menu);
    parent.appendChild(container);

    // Click handler to toggle open
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.custom-dropdown-container').forEach(c => {
        if (c !== container) c.classList.remove('open');
      });
      container.classList.toggle('open');
    });

    // Refresh icons inside custom dropdown
    lucide.createIcons();
  }
};

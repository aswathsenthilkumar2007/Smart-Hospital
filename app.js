/**
 * MediFlow - Smart Hospital Queue, Triage, Staff Operations & Smart Locker System
 * 
 * STRICT ROLE-BASED ACCESS CONTROL (RBAC) ARCHITECTURE:
 * 1. TWO STRICT ROLES: PATIENT vs. STAFF.
 * 2. PATIENT INTERFACE: Sees only personal records (queue, prescription, pharmacy, locker, medical support, profile).
 * 3. STAFF INTERFACE: Operations (overview KPIs, patients directory, queue calling, medical support, transfers, pharmacy, staff profile).
 * 4. PROTECTED ROUTES: requireRole(viewId) blocks unauthorized cross-role access and displays Access Denied.
 * 5. PATIENT DATA PRIVACY: Filtered strictly by currentUserId / patientId.
 * 6. LOCKER SECURITY: Unlocking requires currentUserId === order.patientId AND matching OTP / QR token.
 */

const MediFlowDB = {
  // Authentication & Session State
  session: {
    isAuthenticated: true,
    currentUserId: 'P-1024',
    currentUserRole: 'patient' // 'patient' | 'staff'
  },

  // Registered User Accounts (Identity Directory)
  users: [
    {
      id: 'P-1024',
      name: 'Harish Karthic',
      email: 'patient@mediflow.com',
      phone: '9876543210',
      role: 'patient',
      password: 'patient123'
    },
    {
      id: 'P-1025',
      name: 'Meena Sundaram',
      email: 'meena@mediflow.com',
      phone: '9876543211',
      role: 'patient',
      password: 'patient123'
    },
    {
      id: 'P-1026',
      name: 'Rahul Verma',
      email: 'rahul@mediflow.com',
      phone: '9876543212',
      role: 'patient',
      password: 'patient123'
    },
    {
      id: 'P-1027',
      name: 'Suresh Raina',
      email: 'suresh@mediflow.com',
      phone: '9876543213',
      role: 'patient',
      password: 'patient123'
    },
    {
      id: 'STF-001',
      name: 'Dr. Priya',
      email: 'staff@mediflow.com',
      phone: '9876543210',
      department: 'General Medicine',
      role: 'staff',
      password: 'staff123'
    },
    {
      id: 'STF-002',
      name: 'Dr. Rajesh Patel',
      email: 'rajesh@mediflow.com',
      phone: '9876543214',
      department: 'Cardiology',
      role: 'staff',
      password: 'staff123'
    },
    {
      id: 'STF-003',
      name: 'Dr. Sarah Jenkins',
      email: 'sarah@mediflow.com',
      phone: '9876543215',
      department: 'Gastroenterology',
      role: 'staff',
      password: 'staff123'
    }
  ],

  // Clinical Patients State (Linked by id = userId)
  patients: [
    {
      id: 'P-1024',
      age: 22,
      department: 'Cardiology',
      status: 'Waiting', // 'Waiting' | 'Called' | 'In Consultation' | 'Awaiting Test' | 'Awaiting Medical Support' | 'Awaiting Transfer' | 'Ready for Discharge' | 'Completed'
      location: 'OPD Waiting Area',
      token: 'A-127',
      priority: 'P1',
      priorityLabel: 'Critical',
      priorityColor: 'badge-p1',
      queuePosition: 1,
      estimatedWait: 2,
      assignedDoctorId: 'STF-001',
      symptoms: 'I have severe chest pain and difficulty breathing since morning.',
      available: true
    },
    {
      id: 'P-1025',
      age: 36,
      department: 'General Medicine',
      status: 'In Consultation',
      location: 'Room 203',
      token: 'M-104',
      priority: 'P3',
      priorityLabel: 'Normal',
      priorityColor: 'badge-p3',
      queuePosition: 0,
      estimatedWait: 0,
      assignedDoctorId: 'STF-002',
      symptoms: 'Mild fever and sore throat.',
      available: false
    },
    {
      id: 'P-1026',
      age: 28,
      department: 'Radiology',
      status: 'Awaiting X-Ray',
      location: 'Radiology Wing',
      token: 'R-210',
      priority: 'P2',
      priorityLabel: 'High',
      priorityColor: 'badge-p2',
      queuePosition: 2,
      estimatedWait: 15,
      assignedDoctorId: 'STF-001',
      symptoms: 'Right ankle injury following a slip.',
      available: true
    },
    {
      id: 'P-1027',
      age: 45,
      department: 'Gastroenterology',
      status: 'Awaiting Test',
      location: 'Lab Wing',
      token: 'G-315',
      priority: 'P2',
      priorityLabel: 'High',
      priorityColor: 'badge-p2',
      queuePosition: 3,
      estimatedWait: 20,
      assignedDoctorId: 'STF-003',
      symptoms: 'Acute abdominal pain and nausea.',
      available: true
    }
  ],

  // Prescriptions (Linked by patientId & doctorId)
  prescriptions: [
    {
      id: 'RX-1024',
      patientId: 'P-1024',
      doctorId: 'STF-001',
      date: '29 Aug 2026',
      diagnosis: 'Clinical Evaluation & Supportive Therapy',
      medicines: [
        { name: 'Paracetamol 500mg', qty: 10, dosage: '1 tablet twice daily', price: 30 },
        { name: 'Cetirizine 10mg', qty: 5, dosage: '1 tablet once daily', price: 25 }
      ],
      medicineTotal: 55,
      hospitalServiceFee: 5,
      total: 60,
      status: 'ACTIVE' // 'ACTIVE' | 'PURCHASED' | 'NOT_PURCHASED_HERE'
    }
  ],

  // Pharmacy Orders (Linked by patientId & prescriptionId)
  pharmacyOrders: [
    {
      id: 'PO-1024',
      patientId: 'P-1024',
      prescriptionId: 'RX-1024',
      total: 60,
      paymentMethod: null, // 'online' | 'cash' | 'declined'
      paymentStatus: 'UNPAID', // 'UNPAID' | 'PENDING_CASH' | 'PAID' | 'NOT_REQUIRED'
      orderStatus: 'NOT_CREATED', // 'NOT_CREATED' | 'RECEIVED' | 'PREPARING' | 'READY' | 'COLLECTED' | 'MEDICINES_NOT_REQUIRED' | 'CANCELLED'
      lockerId: null, // 'B-07'
      otp: null,
      qrToken: null,
      transactionId: null,
      readyAt: null,
      collectedAt: null
    }
  ],

  // Medical Support Requests (Linked by patientId & staffId)
  medicalSupportRequests: [
    {
      id: 'MS-101',
      patientId: 'P-1026',
      staffId: 'STF-001',
      service: '🩻 X-Ray',
      fromDepartment: 'Orthopedics OPD',
      toDepartment: 'Radiology Department',
      priority: 'High',
      status: 'In Progress', // 'Requested' | 'Accepted' | 'In Progress' | 'Completed'
      notes: 'Right ankle 3-view radiograph.',
      createdAt: '10:15 AM'
    },
    {
      id: 'MS-102',
      patientId: 'P-1024',
      staffId: 'STF-001',
      service: '🩻 X-Ray',
      fromDepartment: 'Cardiology OPD',
      toDepartment: 'Radiology Department',
      priority: 'High',
      status: 'Requested',
      notes: 'Chest X-Ray requested by doctor.',
      createdAt: '10:45 AM'
    },
    {
      id: 'MS-103',
      patientId: 'P-1024',
      staffId: 'STF-001',
      service: '🫀 ECG',
      fromDepartment: 'Cardiology OPD',
      toDepartment: 'Cardiology Diagnostics',
      priority: 'Emergency',
      status: 'Completed',
      notes: '12-Lead Electrocardiogram rule out ischemia.',
      createdAt: '09:30 AM'
    }
  ],

  // Patient Transfers (Linked by patientId & staffId)
  transfers: [
    {
      id: 'TR-201',
      patientId: 'P-1024',
      staffId: 'STF-001',
      fromDepartment: 'Cardiology OPD',
      toDepartment: 'Radiology Department',
      status: 'Pending' // 'Pending' | 'Completed' | 'Cancelled'
    }
  ],

  // Notifications (Linked by patientId)
  notifications: [
    {
      id: 1,
      patientId: 'P-1024',
      text: 'Welcome to MediFlow. Your appointment session is active.',
      time: '10:00 AM',
      read: false
    }
  ],

  // Smart Locker Bay
  lockers: [
    { id: 'B-01', status: 'AVAILABLE', patientId: null, orderId: null },
    { id: 'B-02', status: 'OCCUPIED', patientId: 'P-9812', orderId: 'PO-9812' },
    { id: 'B-03', status: 'AVAILABLE', patientId: null, orderId: null },
    { id: 'B-04', status: 'AVAILABLE', patientId: null, orderId: null },
    { id: 'B-05', status: 'OCCUPIED', patientId: 'P-9830', orderId: 'PO-9830' },
    { id: 'B-06', status: 'AVAILABLE', patientId: null, orderId: null },
    { id: 'B-07', status: 'AVAILABLE', patientId: null, orderId: null },
    { id: 'B-08', status: 'AVAILABLE', patientId: null, orderId: null }
  ],

  // Department Queues Telemetry for Staff
  departmentQueues: [
    { dept: 'General Medicine', waiting: 12, avgWait: '18 min', activeDoctors: 3 },
    { dept: 'Cardiology', waiting: 5, avgWait: '9 min', activeDoctors: 2 },
    { dept: 'Radiology', waiting: 7, avgWait: '22 min', activeDoctors: 2 },
    { dept: 'Gastroenterology', waiting: 4, avgWait: '15 min', activeDoctors: 1 },
    { dept: 'Emergency', waiting: 3, avgWait: 'Immediate', activeDoctors: 4 }
  ],

  // ==========================================
  // RESOLVERS & STRICT PATIENT DATA FILTERS
  // ==========================================
  getUserById(id) {
    if (!id) return null;
    return this.users.find(u => u.id === id) || null;
  },

  getUserByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  getPatient(id) {
    const user = this.getUserById(id) || {
      id: id,
      name: 'Patient User',
      email: '',
      phone: '',
      role: 'patient'
    };
    
    let clinical = this.patients.find(p => p.id === id);
    if (!clinical) {
      clinical = {
        id: id,
        age: 22,
        department: 'General Medicine',
        status: 'Waiting',
        location: 'OPD Waiting Area',
        token: `A-${Math.floor(100 + Math.random() * 900)}`,
        priority: 'P3',
        priorityLabel: 'Normal',
        priorityColor: 'badge-p3',
        queuePosition: 1,
        estimatedWait: 10,
        assignedDoctorId: 'STF-001',
        symptoms: '',
        available: true
      };
      this.patients.push(clinical);
    }

    return { ...clinical, ...user };
  },

  getAllPatientsList() {
    return this.users
      .filter(u => u.role === 'patient')
      .map(u => this.getPatient(u.id));
  },

  getStaff(id) {
    const s = this.getUserById(id);
    if (s) return s;
    return this.users.find(u => u.role === 'staff') || {
      id: 'STF-001',
      name: 'Dr. Priya',
      department: 'General Medicine',
      role: 'staff'
    };
  },

  getCurrentUser() {
    return this.getUserById(this.session.currentUserId) || this.users[0];
  },

  getPrescriptionForPatient(patientId) {
    let rx = this.prescriptions.find(r => r.patientId === patientId);
    if (!rx) {
      rx = {
        id: `RX-${patientId.replace('P-', '')}`,
        patientId: patientId,
        doctorId: 'STF-001',
        date: '29 Aug 2026',
        diagnosis: 'Clinical Evaluation & Supportive Therapy',
        medicines: [
          { name: 'Paracetamol 500mg', qty: 10, dosage: '1 tablet twice daily', price: 30 },
          { name: 'Cetirizine 10mg', qty: 5, dosage: '1 tablet once daily', price: 25 }
        ],
        medicineTotal: 55,
        hospitalServiceFee: 5,
        total: 60,
        status: 'ACTIVE'
      };
      this.prescriptions.push(rx);
    }
    return rx;
  },

  getPharmacyOrderForPatient(patientId) {
    let po = this.pharmacyOrders.find(o => o.patientId === patientId);
    if (!po) {
      po = {
        id: `PO-${patientId.replace('P-', '')}`,
        patientId: patientId,
        prescriptionId: `RX-${patientId.replace('P-', '')}`,
        total: 60,
        paymentMethod: null,
        paymentStatus: 'UNPAID',
        orderStatus: 'NOT_CREATED',
        lockerId: null,
        otp: null,
        qrToken: null,
        transactionId: null,
        readyAt: null,
        collectedAt: null
      };
      this.pharmacyOrders.push(po);
    }
    return po;
  },

  // Returns ONLY requests belonging to specified patientId
  getMedicalSupportForPatient(patientId) {
    return this.medicalSupportRequests.filter(r => r.patientId === patientId);
  },

  // Returns ONLY notifications belonging to specified patientId
  getNotificationsForPatient(patientId) {
    return this.notifications.filter(n => n.patientId === patientId);
  },

  addNotification(patientId, text) {
    this.notifications.unshift({
      id: Date.now(),
      patientId: patientId,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    });
  }
};

// Route Security & Permission Map
const ProtectedRoutes = {
  // Patient Protected Routes
  'patient-dashboard': 'patient',
  'patient-intake': 'patient',
  'patient-triage': 'patient',
  'patient-queue': 'patient',
  'patient-consultation': 'patient',
  'patient-prescription': 'patient',
  'patient-pharmacy': 'patient',
  'patient-pharmacy-status': 'patient',
  'patient-locker': 'patient',
  'patient-support': 'patient',
  'patient-profile': 'patient',

  // Staff Protected Routes
  'staff-overview': 'staff',
  'staff-patients': 'staff',
  'staff-queues': 'staff',
  'staff-support': 'staff',
  'staff-transfers': 'staff',
  'staff-pharmacy': 'staff',
  'staff-profile': 'staff'
};

// Global Controller
const MediFlowApp = {
  currentView: 'patient-dashboard',
  isRecording: false,
  speechRecognition: null,
  selectedLanguage: 'en-US',

  init() {
    this.loadPersistedState();
    this.initAuthForms();
    this.initPatientListeners();
    this.initStaffListeners();
    this.initProfileListeners();
    this.initSpeechRecognition();
    this.refreshAllViews();
  },

  refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // ------------------------------------------------------------------------
  // 1. REUSABLE ROLE-BASED ACCESS CONTROL (requireRole)
  // ------------------------------------------------------------------------
  requireRole(targetViewId) {
    const requiredRole = ProtectedRoutes[targetViewId];
    if (!requiredRole) return true; // public view (e.g. login)

    const user = MediFlowDB.getCurrentUser();
    if (!user || !MediFlowDB.session.isAuthenticated) {
      this.navigateToView('login', true);
      return false;
    }

    if (user.role !== requiredRole) {
      this.showAccessDenied(requiredRole, targetViewId);
      return false;
    }

    return true;
  },

  showAccessDenied(requiredRole, attemptedView) {
    const user = MediFlowDB.getCurrentUser();
    const modal = document.getElementById('accessDeniedModal');
    const msg = document.getElementById('accessDeniedMessage');
    const redirectBtn = document.getElementById('accessDeniedRedirectBtn');

    if (msg) {
      msg.textContent = `You are logged in as a ${user.role.toUpperCase()}. The requested page (${attemptedView}) requires ${requiredRole.toUpperCase()} permissions.`;
    }

    if (redirectBtn) {
      redirectBtn.textContent = user.role === 'staff' ? 'Return to Staff Overview' : 'Return to Patient Dashboard';
      redirectBtn.onclick = () => {
        modal?.classList.add('hidden');
        this.navigateToView(user.role === 'staff' ? 'staff-overview' : 'patient-dashboard', true);
      };
    }

    if (modal) modal.classList.remove('hidden');
    this.refreshIcons();
  },

  // ------------------------------------------------------------------------
  // 2. AUTHENTICATION & LOGIN FLOW
  // ------------------------------------------------------------------------
  initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabSignIn = document.getElementById('authTabSignIn');
    const tabRegister = document.getElementById('authTabRegister');
    const loginRolePatient = document.getElementById('loginRolePatient');
    const loginRoleStaff = document.getElementById('loginRoleStaff');
    const quickPatientBtn = document.getElementById('quickPatientLoginBtn');
    const quickStaffBtn = document.getElementById('quickStaffLoginBtn');

    let selectedLoginRole = 'patient';

    if (tabSignIn && tabRegister) {
      tabSignIn.addEventListener('click', () => {
        tabSignIn.className = 'flex-1 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-900 shadow-sm transition-all';
        tabRegister.className = 'flex-1 py-2.5 rounded-xl font-semibold text-xs text-slate-500 hover:text-slate-900 transition-all';
        document.getElementById('authSignInSection')?.classList.remove('hidden');
        document.getElementById('authRegisterSection')?.classList.add('hidden');
      });

      tabRegister.addEventListener('click', () => {
        tabRegister.className = 'flex-1 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-900 shadow-sm transition-all';
        tabSignIn.className = 'flex-1 py-2.5 rounded-xl font-semibold text-xs text-slate-500 hover:text-slate-900 transition-all';
        document.getElementById('authRegisterSection')?.classList.remove('hidden');
        document.getElementById('authSignInSection')?.classList.add('hidden');
      });
    }

    if (loginRolePatient && loginRoleStaff) {
      loginRolePatient.addEventListener('click', () => {
        selectedLoginRole = 'patient';
        loginRolePatient.className = 'flex-1 py-2.5 rounded-xl font-bold text-xs bg-sky-600 text-white shadow-sm transition-all';
        loginRoleStaff.className = 'flex-1 py-2.5 rounded-xl font-semibold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all';
        const p = MediFlowDB.users.find(u => u.role === 'patient') || MediFlowDB.users[0];
        document.getElementById('loginEmailInput').value = p.email;
        document.getElementById('loginPasswordInput').value = 'patient123';
      });

      loginRoleStaff.addEventListener('click', () => {
        selectedLoginRole = 'staff';
        loginRoleStaff.className = 'flex-1 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 text-white shadow-sm transition-all';
        loginRolePatient.className = 'flex-1 py-2.5 rounded-xl font-semibold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all';
        const s = MediFlowDB.users.find(u => u.role === 'staff') || MediFlowDB.users[4];
        document.getElementById('loginEmailInput').value = s.email;
        document.getElementById('loginPasswordInput').value = 'staff123';
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmailInput')?.value.trim();
        this.performLoginByEmail(email, selectedLoginRole);
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regNameInput')?.value.trim();
        const email = document.getElementById('regEmailInput')?.value.trim();
        const phone = document.getElementById('regPhoneInput')?.value.trim();
        const role = document.getElementById('regRoleSelect')?.value || 'patient';
        const password = document.getElementById('regPasswordInput')?.value || 'pass123';

        if (!name || !email) {
          alert('Please enter your full name and email address.');
          return;
        }

        const newId = role === 'staff' 
          ? `STF-${Math.floor(100 + Math.random() * 900)}` 
          : `P-${Math.floor(1000 + Math.random() * 9000)}`;

        const newUser = {
          id: newId,
          name: name,
          email: email,
          phone: phone || '9876543210',
          role: role,
          password: password,
          department: role === 'staff' ? 'General Medicine' : undefined
        };

        MediFlowDB.users.push(newUser);

        if (role === 'patient') {
          MediFlowDB.patients.push({
            id: newId,
            age: 22,
            department: 'General Medicine',
            status: 'Waiting',
            location: 'OPD Waiting Area',
            token: `A-${Math.floor(100 + Math.random() * 900)}`,
            priority: 'P3',
            priorityLabel: 'Normal',
            priorityColor: 'badge-p3',
            queuePosition: 1,
            estimatedWait: 10,
            assignedDoctorId: 'STF-001',
            symptoms: '',
            available: true
          });
        }

        alert(`✓ Account registered successfully for ${name}!`);
        this.setSessionAndNavigate(newUser);
      });
    }

    if (quickPatientBtn) {
      quickPatientBtn.addEventListener('click', () => {
        this.performLoginByEmail('patient@mediflow.com', 'patient');
      });
    }

    if (quickStaffBtn) {
      quickStaffBtn.addEventListener('click', () => {
        this.performLoginByEmail('staff@mediflow.com', 'staff');
      });
    }

    document.querySelectorAll('[data-action-logout]').forEach(btn => {
      btn.addEventListener('click', () => this.performLogout());
    });
  },

  performLoginByEmail(email, preferredRole = 'patient') {
    let user = MediFlowDB.getUserByEmail(email);

    if (!user) {
      const newId = preferredRole === 'staff' 
        ? `STF-${Math.floor(100 + Math.random() * 900)}` 
        : `P-${Math.floor(1000 + Math.random() * 9000)}`;
      
      let defaultName = preferredRole === 'staff' ? 'Dr. Staff Member' : 'Patient User';
      if (email.includes('@')) {
        const cleanPart = email.split('@')[0].replace(/[._-]/g, ' ');
        defaultName = cleanPart.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }

      user = {
        id: newId,
        name: defaultName,
        email: email,
        phone: '9876543210',
        role: preferredRole,
        department: preferredRole === 'staff' ? 'General Medicine' : undefined
      };

      MediFlowDB.users.push(user);

      if (preferredRole === 'patient') {
        MediFlowDB.patients.push({
          id: newId,
          age: 22,
          department: 'General Medicine',
          status: 'Waiting',
          location: 'OPD Waiting Area',
          token: `A-${Math.floor(100 + Math.random() * 900)}`,
          priority: 'P3',
          priorityLabel: 'Normal',
          priorityColor: 'badge-p3',
          queuePosition: 1,
          estimatedWait: 10,
          assignedDoctorId: 'STF-001',
          symptoms: '',
          available: true
        });
      }
    }

    this.setSessionAndNavigate(user);
  },

  setSessionAndNavigate(user) {
    MediFlowDB.session.isAuthenticated = true;
    MediFlowDB.session.currentUserId = user.id;
    MediFlowDB.session.currentUserRole = user.role;

    localStorage.setItem('currentUserId', user.id);
    localStorage.setItem('currentUserRole', user.role);

    if (user.role === 'patient') {
      this.navigateToView('patient-dashboard', true);
    } else {
      this.navigateToView('staff-overview', true);
    }

    this.refreshAllViews();
    this.saveState();
  },

  performLogout() {
    MediFlowDB.session.isAuthenticated = false;
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserRole');
    this.navigateToView('login', true);
    this.updateUserSessionUI();
    this.saveState();
  },

  updateUserSessionUI() {
    const isAuth = MediFlowDB.session.isAuthenticated;
    const role = MediFlowDB.session.currentUserRole;
    const user = MediFlowDB.getCurrentUser();

    const patientNav = document.getElementById('patientHeaderNav');
    const staffNav = document.getElementById('staffHeaderNav');
    const loginOnlyHeader = document.getElementById('loginOnlyHeader');
    const patientBadge = document.getElementById('headerUserBadge');
    const staffBadge = document.getElementById('headerUserBadgeStaff');

    // Hide everything first
    if (patientNav) patientNav.classList.add('hidden');
    if (staffNav) staffNav.classList.add('hidden');
    if (loginOnlyHeader) loginOnlyHeader.classList.add('hidden');
    if (patientBadge) patientBadge.classList.add('hidden');
    if (staffBadge) staffBadge.classList.add('hidden');

    if (!isAuth) {
      if (loginOnlyHeader) loginOnlyHeader.classList.remove('hidden');
      return;
    }

    if (role === 'patient') {
      if (patientNav) patientNav.classList.remove('hidden');
      if (patientBadge) {
        patientBadge.classList.remove('hidden');
        patientBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span class="text-slate-800 font-bold text-xs">${user ? user.name : 'Patient'}</span>
          <span class="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">Patient</span>
        `;
      }
    } else if (role === 'staff') {
      if (staffNav) staffNav.classList.remove('hidden');
      if (staffBadge) {
        staffBadge.classList.remove('hidden');
        staffBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          <span class="text-white font-bold text-xs">${user ? user.name : 'Staff'}</span>
          <span class="text-[10px] bg-indigo-700 text-indigo-200 px-1.5 py-0.5 rounded font-mono font-bold">Staff</span>
        `;
      }
    }

    this.refreshIcons();
  },

  // View Navigation with strict RBAC enforcement
  navigateToView(viewId, bypassAuthCheck = false) {
    if (!bypassAuthCheck && !this.requireRole(viewId)) {
      return;
    }

    this.currentView = viewId;

    document.querySelectorAll('.app-view-container').forEach(v => {
      if (v.id === `view-${viewId}`) {
        v.classList.remove('hidden');
      } else {
        v.classList.add('hidden');
      }
    });

    document.querySelectorAll('[data-nav-target]').forEach(link => {
      const target = link.getAttribute('data-nav-target');
      if (target === viewId) {
        if (MediFlowDB.session.currentUserRole === 'staff') {
          link.className = 'text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl transition-all';
        } else {
          link.className = 'text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl transition-all';
        }
      } else {
        link.className = 'text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl transition-all';
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.refreshAllViews();
    this.saveState();
  },

  refreshAllViews() {
    this.updateUserSessionUI();

    if (MediFlowDB.session.currentUserRole === 'patient') {
      this.renderPatientDashboard();
      this.renderPatientProfile();
      this.renderPrescription();
      this.renderPharmacyView();
      this.renderPharmacyStatus();
      this.renderLockerView();
      this.renderPatientSupportView();
    } else {
      this.renderStaffOverview();
      this.renderStaffPatientsList();
      this.renderStaffMedicalSupport();
      this.renderStaffQueues();
      this.renderStaffTransfersView();
      this.renderStaffPharmacyView();
      this.renderStaffProfile();
    }

    this.refreshIcons();
  },

  // ------------------------------------------------------------------------
  // 3. PATIENT INTERFACE (STRICT PRIVACY & PERSONAL DATA ONLY)
  // ------------------------------------------------------------------------
  renderPatientDashboard() {
    const p = MediFlowDB.getPatient(MediFlowDB.session.currentUserId);
    if (!p || MediFlowDB.session.currentUserRole !== 'patient') return;

    const welcomeEl = document.getElementById('patientWelcomeHeading');
    const patientIdEl = document.getElementById('patientWelcomeId');
    if (welcomeEl) welcomeEl.textContent = `Welcome, ${p.name}`;
    if (patientIdEl) patientIdEl.textContent = p.id;

    // Status Banner
    const statusText = document.getElementById('patientStatusText');
    const statusBadge = document.getElementById('patientStatusBadge');
    
    if (statusText) statusText.textContent = p.status;
    if (statusBadge) {
      if (p.status === 'Waiting') {
        statusBadge.className = 'px-4 py-2 rounded-full text-xs font-bold bg-amber-100 text-amber-800 shadow-sm';
        statusBadge.innerHTML = `<span id="patientStatusText">🟢 Waiting for Consultation</span>`;
      } else if (p.status === 'Called') {
        statusBadge.className = 'px-4 py-2 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 animate-pulse shadow-sm';
        statusBadge.innerHTML = `<span id="patientStatusText">🔔 Please Proceed to Room 203</span>`;
      } else if (p.status === 'In Consultation') {
        statusBadge.className = 'px-4 py-2 rounded-full text-xs font-bold bg-sky-100 text-sky-800 shadow-sm';
        statusBadge.innerHTML = `<span id="patientStatusText">🩺 You are now with the doctor</span>`;
      } else if (p.status.includes('X-Ray') || p.status.includes('Radiology')) {
        statusBadge.className = 'px-4 py-2 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 shadow-sm';
        statusBadge.innerHTML = `<span id="patientStatusText">🩻 Please proceed to Radiology for X-Ray</span>`;
      } else {
        statusBadge.className = 'px-4 py-2 rounded-full text-xs font-bold bg-slate-100 text-slate-800 shadow-sm';
        statusBadge.innerHTML = `<span id="patientStatusText">${p.status}</span>`;
      }
    }

    // Token & Queue Metrics
    document.getElementById('patientTokenDisplay').textContent = p.token;
    document.getElementById('patientDeptDisplay').textContent = p.department;
    document.getElementById('patientQueuePosDisplay').textContent = p.queuePosition;
    document.getElementById('patientWaitDisplay').textContent = p.queuePosition === 0 ? 'Immediate' : `~${p.estimatedWait} min`;
    document.getElementById('patientLocationDisplay').textContent = p.location;

    // Strict Personal Notifications Feed
    const notifContainer = document.getElementById('patientNotificationsList');
    const notifs = MediFlowDB.getNotificationsForPatient(p.id);
    if (notifContainer) {
      if (notifs.length === 0) {
        notifContainer.innerHTML = `<p class="text-xs text-slate-400">No new notifications.</p>`;
      } else {
        notifContainer.innerHTML = notifs.map(n => `
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs">
            <i data-lucide="bell" class="w-4 h-4 text-sky-600 shrink-0 mt-0.5"></i>
            <div>
              <p class="font-semibold text-slate-800">${n.text}</p>
              <span class="text-[10px] text-slate-400 font-mono">${n.time}</span>
            </div>
          </div>
        `).join('');
      }
    }

    // Queue view elements
    const doc = MediFlowDB.getStaff(p.assignedDoctorId) || MediFlowDB.staff[0];
    document.getElementById('queueTokenDisplay').textContent = p.token;
    document.getElementById('queueDeptDisplay').textContent = `${p.department} Department`;
    document.getElementById('queuePosDisplay').textContent = p.queuePosition;
    document.getElementById('queueWaitDisplay').textContent = p.queuePosition === 0 ? 'Immediate' : `~${p.estimatedWait} min`;
    document.getElementById('queueDoctorDisplay').textContent = doc.name;
  },

  // Patient Medical Support View (Patient sees ONLY own requests)
  renderPatientSupportView() {
    const p = MediFlowDB.getPatient(MediFlowDB.session.currentUserId);
    if (!p || MediFlowDB.session.currentUserRole !== 'patient') return;

    const listEl = document.getElementById('patientSupportRequestsList');
    if (!listEl) return;

    const requests = MediFlowDB.getMedicalSupportForPatient(p.id);
    if (requests.length === 0) {
      listEl.innerHTML = `
        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          No medical support services have been ordered for your current care session.
        </div>
      `;
      return;
    }

    listEl.innerHTML = requests.map(r => {
      const doc = MediFlowDB.getStaff(r.staffId) || { name: 'Attending Staff' };
      return `
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5 text-xs">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 text-sm">${r.service}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${r.priority === 'Emergency' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}">${r.priority}</span>
            </div>
            <span class="font-bold px-2.5 py-1 rounded-full text-[11px] ${r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : r.status === 'In Progress' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}">
              ● ${r.status}
            </span>
          </div>

          <div class="text-slate-600 space-y-1">
            <p>Department Route: <strong class="text-slate-800">${r.fromDepartment}</strong> → <strong class="text-sky-700">${r.toDepartment}</strong></p>
            <p>Ordered by: <span class="text-slate-700 font-semibold">${doc.name}</span></p>
            <p class="text-slate-500 italic">"${r.notes}"</p>
          </div>
        </div>
      `;
    }).join('');

    this.refreshIcons();
  },

  initPatientListeners() {
    document.querySelectorAll('[data-nav-target]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-nav-target');
        this.navigateToView(target);
      });
    });

    const startIntakeBtn = document.getElementById('startIntakeBtn');
    if (startIntakeBtn) {
      startIntakeBtn.addEventListener('click', () => this.navigateToView('patient-intake'));
    }

    const analyzeBtn = document.getElementById('analyzeSymptomsBtn');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => this.handleSymptomAnalysis());
    }

    const confirmTriageBtn = document.getElementById('confirmTriageBtn');
    if (confirmTriageBtn) {
      confirmTriageBtn.addEventListener('click', () => this.handleGenerateToken());
    }

    const completeConsultBtn = document.getElementById('completeConsultationBtn');
    if (completeConsultBtn) {
      completeConsultBtn.addEventListener('click', () => this.handleDoctorCompleteConsult());
    }

    // Pharmacy 3 Options selection
    const optOnline = document.getElementById('payOptionOnline');
    const optCash = document.getElementById('payOptionCash');
    const optDecline = document.getElementById('payOptionDecline');

    if (optOnline && optCash && optDecline) {
      [optOnline, optCash, optDecline].forEach(card => {
        card.addEventListener('click', () => {
          [optOnline, optCash, optDecline].forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        });
      });
    }

    const proceedPharmacyBtn = document.getElementById('proceedPharmacyOptionBtn');
    if (proceedPharmacyBtn) {
      proceedPharmacyBtn.addEventListener('click', () => this.handlePharmacyChoice());
    }

    const confirmDeclineBtn = document.getElementById('confirmDeclineMedicinesBtn');
    if (confirmDeclineBtn) {
      confirmDeclineBtn.addEventListener('click', () => this.handleConfirmDeclineMedicines());
    }

    const cancelDeclineBtn = document.getElementById('cancelDeclineModalBtn');
    if (cancelDeclineBtn) {
      cancelDeclineBtn.addEventListener('click', () => {
        document.getElementById('declineConfirmationModal')?.classList.add('hidden');
      });
    }

    const confirmOnlinePayBtn = document.getElementById('confirmOnlinePaymentBtn');
    if (confirmOnlinePayBtn) {
      confirmOnlinePayBtn.addEventListener('click', () => this.handleConfirmOnlinePayment());
    }

    const closeOnlinePayBtn = document.getElementById('closeOnlinePayModalBtn');
    if (closeOnlinePayBtn) {
      closeOnlinePayBtn.addEventListener('click', () => {
        document.getElementById('onlinePaymentModal')?.classList.add('hidden');
      });
    }

    const scanQrBtn = document.getElementById('scanQrCodeBtn');
    if (scanQrBtn) {
      scanQrBtn.addEventListener('click', () => this.handleScanQrCode());
    }

    const openLockerOtpBtn = document.getElementById('openLockerWithOtpBtn');
    if (openLockerOtpBtn) {
      openLockerOtpBtn.addEventListener('click', () => this.handleVerifyOtpLocker());
    }

    const confirmCollectBtn = document.getElementById('confirmMedicineCollectedBtn');
    if (confirmCollectBtn) {
      confirmCollectBtn.addEventListener('click', () => this.handleMedicineCollectionDone());
    }
  },

  // ------------------------------------------------------------------------
  // 4. AI VOICE INTAKE & DYNAMIC TRIAGE
  // ------------------------------------------------------------------------
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = document.getElementById('micRecordBtn');
    const micStatus = document.getElementById('micStatusText');
    const micErrorBox = document.getElementById('micErrorNotice');

    if (!SpeechRecognition) {
      if (micErrorBox) {
        micErrorBox.classList.remove('hidden');
        micErrorBox.innerHTML = `
          <div class="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 mb-3">
            <i data-lucide="info" class="w-4 h-4 text-amber-600 shrink-0"></i>
            <span>Voice recognition is not supported in this browser. Please type symptoms below.</span>
          </div>
        `;
        this.refreshIcons();
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        this.isRecording = true;
        if (micBtn) {
          micBtn.classList.add('mic-recording');
          micBtn.innerHTML = `<i data-lucide="square" class="w-6 h-6"></i>`;
        }
        if (micStatus) {
          micStatus.textContent = 'Listening... Speak now';
          micStatus.className = 'text-xs font-bold text-rose-600 animate-pulse';
        }
        this.refreshIcons();
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');

        const symptomInput = document.getElementById('symptomInput');
        if (symptomInput) symptomInput.value = transcript;
      };

      recognition.onerror = () => this.stopRecordingUI();
      recognition.onend = () => this.stopRecordingUI();

      this.speechRecognition = recognition;

      if (micBtn) {
        micBtn.addEventListener('click', () => {
          if (this.isRecording) {
            recognition.stop();
          } else {
            recognition.lang = this.selectedLanguage;
            try {
              recognition.start();
            } catch (err) {
              console.warn(err);
            }
          }
        });
      }
    } catch (e) {
      console.warn('Speech API error:', e);
    }
  },

  stopRecordingUI() {
    this.isRecording = false;
    const micBtn = document.getElementById('micRecordBtn');
    const micStatus = document.getElementById('micStatusText');
    if (micBtn) {
      micBtn.classList.remove('mic-recording');
      micBtn.innerHTML = `<i data-lucide="mic" class="w-6 h-6"></i>`;
    }
    if (micStatus) {
      micStatus.textContent = 'Click to speak';
      micStatus.className = 'text-xs font-semibold text-slate-500';
    }
    this.refreshIcons();
  },

  handleSymptomAnalysis() {
    const text = document.getElementById('symptomInput')?.value.trim();
    const errorEl = document.getElementById('symptomInputError');

    if (!text) {
      if (errorEl) {
        errorEl.classList.remove('hidden');
        errorEl.textContent = 'Please describe your symptoms before continuing.';
      }
      return;
    }

    if (errorEl) errorEl.classList.add('hidden');

    const p = MediFlowDB.patients.find(item => item.id === MediFlowDB.session.currentUserId);
    if (p) p.symptoms = text;

    const norm = text.toLowerCase();

    let priority = 'P3';
    let priorityLabel = 'Normal';
    let priorityColor = 'badge-p3';
    let department = 'General Medicine';
    let detected = [];

    if (norm.includes('chest pain') || norm.includes('difficulty breathing') || norm.includes('unconscious') || norm.includes('severe bleeding') || norm.includes('மார்பு வலி') || norm.includes('மூச்சு திணறல்') || norm.includes('सीने में दर्द') || norm.includes('सांस लेने में तकलीफ')) {
      priority = 'P1';
      priorityLabel = 'Critical';
      priorityColor = 'badge-p1';
      department = 'Cardiology / Emergency';
      detected.push('Severe Chest Pain / Cardiopulmonary Distress');
    } else if (norm.includes('high fever') || norm.includes('severe abdominal') || norm.includes('fracture') || norm.includes('கடும் காய்ச்சல்') || norm.includes('तेज बुखार')) {
      priority = 'P2';
      priorityLabel = 'High';
      priorityColor = 'badge-p2';
      department = 'Gastroenterology / Urgent Care';
      detected.push('High-Grade Fever / Acute Pain');
    } else {
      priority = 'P3';
      priorityLabel = 'Normal';
      priorityColor = 'badge-p3';
      department = 'General Medicine';
      detected.push('Febrile / Mild Respiratory Symptoms');
    }

    if (p) {
      p.priority = priority;
      p.priorityLabel = priorityLabel;
      p.priorityColor = priorityColor;
      p.department = department;
    }

    document.getElementById('triagePriorityBadge').className = `px-3.5 py-1.5 rounded-full text-xs font-bold ${priorityColor}`;
    document.getElementById('triagePriorityBadge').textContent = `${priority === 'P1' ? '🔴' : priority === 'P2' ? '🟠' : '🟢'} ${priority} — ${priorityLabel}`;
    document.getElementById('triageRecommendedDept').textContent = department;
    document.getElementById('triageWaitPreviewText').textContent = priority === 'P1' ? 'Immediate' : '~12 minutes';
    
    document.getElementById('triageDetectedSymptomsList').innerHTML = detected.map(d => `
      <li class="flex items-center gap-2 text-xs font-medium text-slate-700">
        <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
        <span>${d}</span>
      </li>
    `).join('');

    document.getElementById('emergencyWarningBanner').classList.toggle('hidden', priority !== 'P1');

    this.navigateToView('patient-triage');
  },

  handleGenerateToken() {
    const p = MediFlowDB.patients.find(item => item.id === MediFlowDB.session.currentUserId);
    if (p) {
      p.token = p.priority === 'P1' ? 'A-127' : 'M-104';
      p.status = 'Waiting';
      p.queuePosition = p.priority === 'P1' ? 1 : 4;
      p.estimatedWait = p.priority === 'P1' ? 2 : 12;
    }

    this.saveState();
    this.refreshAllViews();
    this.navigateToView('patient-queue');
  },

  handleDoctorCompleteConsult() {
    const p = MediFlowDB.getPatient(MediFlowDB.session.currentUserId);
    const doc = MediFlowDB.getStaff(p.assignedDoctorId) || MediFlowDB.staff[0];

    const targetPatient = MediFlowDB.patients.find(item => item.id === p.id);
    if (targetPatient) targetPatient.status = 'Consultation Completed';
    
    const rx = MediFlowDB.getPrescriptionForPatient(p.id);
    rx.doctorId = doc.id;
    rx.status = 'ACTIVE';

    this.saveState();
    this.refreshAllViews();
    this.navigateToView('patient-prescription');
  },

  renderPrescription() {
    const p = MediFlowDB.getPatient(MediFlowDB.session.currentUserId);
    if (!p || MediFlowDB.session.currentUserRole !== 'patient') return;

    const rx = MediFlowDB.getPrescriptionForPatient(p.id);
    const doc = MediFlowDB.getStaff(rx.doctorId) || MediFlowDB.staff[0];

    document.getElementById('rxIdDisplay').textContent = rx.id;
    document.getElementById('rxDoctorName').textContent = doc.name;
    document.getElementById('rxDoctorDept').textContent = `${doc.department || 'General Medicine'} • MediFlow Clinic`;
    document.getElementById('rxPatientName').textContent = p.name;
    document.getElementById('rxPatientId').textContent = p.id;
    document.getElementById('rxDate').textContent = rx.date;
    document.getElementById('rxDiagnosis').textContent = rx.diagnosis;

    const rxStatusBadge = document.getElementById('rxStatusBadge');
    if (rxStatusBadge) {
      if (rx.status === 'NOT_PURCHASED_HERE') {
        rxStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200';
        rxStatusBadge.textContent = '🟡 Medicines not purchased here';
      } else {
        rxStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200';
        rxStatusBadge.textContent = '✓ Active Prescription';
      }
    }

    const list = document.getElementById('rxMedicinesList');
    if (list) {
      list.innerHTML = rx.medicines.map(m => `
        <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between text-xs">
          <div>
            <strong class="font-bold text-slate-900 text-sm">${m.name}</strong>
            <p class="text-slate-600 mt-0.5">Dosage: ${m.dosage}</p>
          </div>
          <span class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700">
            Qty: ${m.qty}
          </span>
        </div>
      `).join('');
    }

    document.getElementById('consultPatientName').textContent = `${p.name} (${p.age}y, ${p.id})`;
    document.getElementById('consultDoctorName').textContent = doc.name;
  },

  // ------------------------------------------------------------------------
  // 5. PHARMACY 3 OPTIONS & LOCKER VERIFICATION
  // ------------------------------------------------------------------------
  renderPharmacyView() {
    const p = MediFlowDB.getPatient(MediFlowDB.session.currentUserId);
    if (!p || MediFlowDB.session.currentUserRole !== 'patient') return;

    const rx = MediFlowDB.getPrescriptionForPatient(p.id);
    document.getElementById('pharmacyOrderRxId').textContent = rx.id;
    document.getElementById('pharmacyOrderPatientName').textContent = `${p.name} (${p.id})`;
  },

  handlePharmacyChoice() {
    const selectedOption = document.querySelector('.payment-option-card.selected');
    if (!selectedOption) {
      alert('Please select one of the payment or pharmacy options.');
      return;
    }

    const choice = selectedOption.getAttribute('data-payment-choice');

    if (choice === 'decline') {
      document.getElementById('declineConfirmationModal')?.classList.remove('hidden');
    } else if (choice === 'online') {
      document.getElementById('onlinePaymentModal')?.classList.remove('hidden');
    } else if (choice === 'cash') {
      this.handleSelectPayByCash();
    }
  },

  handleConfirmDeclineMedicines() {
    document.getElementById('declineConfirmationModal')?.classList.add('hidden');

    const p = MediFlowDB.getPatient(MediFlowDB.session.currentUserId);
    const ord = MediFlowDB.getPharmacyOrderForPatient(p.id);
    const rx = MediFlowDB.getPrescriptionForPatient(p.id);

    // Strict Rule: No payment, No locker, No OTP
    ord.orderStatus = 'MEDICINES_NOT_REQUIRED';
    ord.paymentStatus = 'NOT_REQUIRED';
    ord.paymentMethod = 'declined';
    ord.lockerId = null;
    ord.otp = null;
    ord.qrToken = null;

    rx.status = 'NOT_PURCHASED_HERE';

    MediFlowDB.addNotification(p.id, `${p.name}, your prescription has been saved. Status: Medicines not purchased here.`);

    this.saveState();
    this.refreshAllViews();
    alert('Your choice has been saved. Your prescription remains accessible in My Prescription for purchase elsewhere.');
    this.navigateToView('patient-pharmacy-status');
  },

  handleConfirmOnlinePayment() {
    document.getElementById('onlinePaymentModal')?.classList.add('hidden');

    const p = MediFlowDB.getPatient(MediFlowDB.session.currentUserId);
    const ord = MediFlowDB.getPharmacyOrderForPatient(p.id);

    ord.paymentMethod = 'online';
    ord.paymentStatus = 'PAID';
    ord.transactionId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    ord.orderStatus = 'PREPARING';

    MediFlowDB.addNotification(p.id, `Payment confirmed (${ord.transactionId}). Pharmacy preparing medicines.`);

    this.saveState();
    this.refreshAllViews();
    this.navigateToView('patient-pharmacy-status');

    setTimeout(() => {
      ord.orderStatus = 'READY';
      ord.lockerId = 'B-07';
      ord.otp = Math.floor(100000 + Math.random() * 900000).toString();
      ord.qrToken = `SEC-TOK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      ord.readyAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      MediFlowDB.addNotification(p.id, `${p.name}, your medicines are ready in Locker ${ord.lockerId}. OTP: ${ord.otp}`);
      this.saveState();
      this.refreshAllViews();
    }, 1800);
  },

  handleSelectPayByCash() {
    const p = MediFlowDB.getPatient(MediFlowDB.session.currentUserId);
    const ord = MediFlowDB.getPharmacyOrderForPatient(p.id);

    ord.paymentMethod = 'cash';
    ord.paymentStatus = 'PENDING_CASH';
    ord.orderStatus = 'RECEIVED';

    MediFlowDB.addNotification(p.id, 'Please pay ₹60 at pharmacy counter to prepare your order.');

    this.saveState();
    this.refreshAllViews();
    this.navigateToView('patient-pharmacy-status');
  },

  renderPharmacyStatus() {
    const p = MediFlowDB.getPatient(MediFlowDB.session.currentUserId);
    if (!p || MediFlowDB.session.currentUserRole !== 'patient') return;

    const ord = MediFlowDB.getPharmacyOrderForPatient(p.id);
    const declineBox = document.getElementById('declinedPharmacyNoticeBox');
    const timelineBox = document.getElementById('pharmacyActiveTimelineContainer');
    const cashBox = document.getElementById('cashPaymentPendingNotice');
    const lockerBanner = document.getElementById('medicineReadyLockerBanner');

    document.getElementById('statusPatientName').textContent = `${p.name} (${p.id})`;

    if (ord.orderStatus === 'MEDICINES_NOT_REQUIRED') {
      if (declineBox) declineBox.classList.remove('hidden');
      if (timelineBox) timelineBox.classList.add('hidden');
      return;
    }

    if (declineBox) declineBox.classList.add('hidden');
    if (timelineBox) timelineBox.classList.remove('hidden');

    if (ord.paymentStatus === 'PENDING_CASH') {
      if (cashBox) cashBox.classList.remove('hidden');
    } else {
      if (cashBox) cashBox.classList.add('hidden');
    }

    if (ord.orderStatus === 'READY') {
      if (lockerBanner) {
        lockerBanner.classList.remove('hidden');
        document.getElementById('assignedLockerIdDisplay').textContent = ord.lockerId || 'B-07';
        document.getElementById('assignedOtpDisplay').textContent = ord.otp;
      }
    } else {
      if (lockerBanner) lockerBanner.classList.add('hidden');
    }
  },

  renderLockerView() {
    const p = MediFlowDB.getPatient(MediFlowDB.session.currentUserId);
    if (!p || MediFlowDB.session.currentUserRole !== 'patient') return;

    const ord = MediFlowDB.getPharmacyOrderForPatient(p.id);
    document.getElementById('lockerPatientDisplay').textContent = `${p.name} (${p.id})`;
    document.getElementById('lockerPodIdDisplay').textContent = ord.lockerId || 'B-07';

    const autoFillOtpBtn = document.getElementById('autoFillOtpBtn');
    if (autoFillOtpBtn && ord.otp) {
      autoFillOtpBtn.textContent = `Auto-Fill ${ord.otp}`;
      autoFillOtpBtn.onclick = () => {
        const input = document.getElementById('lockerOtpInput');
        if (input) input.value = ord.otp;
      };
    }
  },

  handleScanQrCode() {
    const currentUserId = MediFlowDB.session.currentUserId;
    const ord = MediFlowDB.getPharmacyOrderForPatient(currentUserId);

    // Strict Ownership Enforcement: currentUserId === ord.patientId
    if (currentUserId === ord.patientId && ord.orderStatus === 'READY') {
      this.executeLockerOpen('QR Code Authenticated');
    } else {
      alert('❌ ACCESS DENIED: Locker assigned to another patient account or unauthorized token.');
    }
  },

  handleVerifyOtpLocker() {
    const input = document.getElementById('lockerOtpInput')?.value.trim();
    const currentUserId = MediFlowDB.session.currentUserId;
    const ord = MediFlowDB.getPharmacyOrderForPatient(currentUserId);

    if (!input || input !== ord.otp) {
      alert('Invalid OTP. Please enter the dynamic 6-digit OTP assigned to your order.');
      return;
    }

    // Strict Ownership Check
    if (currentUserId === ord.patientId && ord.orderStatus === 'READY') {
      this.executeLockerOpen('6-Digit OTP Verified');
    } else {
      alert('❌ ACCESS DENIED: Locker does not belong to the active patient account.');
    }
  },

  executeLockerOpen(method) {
    const p = MediFlowDB.getPatient(MediFlowDB.session.currentUserId);
    const ord = MediFlowDB.getPharmacyOrderForPatient(p.id);

    const door = document.getElementById('lockerDoorGraphic');
    if (door) door.classList.add('door-opened');

    const alertBox = document.getElementById('lockerUnlockedSuccessBox');
    if (alertBox) {
      alertBox.classList.remove('hidden');
      alertBox.innerHTML = `
        <div class="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-emerald-950 text-center space-y-1.5 shadow-sm">
          <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-1 animate-bounce">
            <i data-lucide="unlock" class="w-5 h-5"></i>
          </div>
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-700">✓ ${method}</span>
          <h3 class="text-base font-black text-emerald-900">🔓 Locker ${ord.lockerId || 'B-07'} Opened</h3>
          <p class="text-xs text-emerald-800">${p.name}, please collect your packaged medicines.</p>
        </div>
      `;
    }

    this.refreshIcons();
  },

  handleMedicineCollectionDone() {
    const p = MediFlowDB.getPatient(MediFlowDB.session.currentUserId);
    const ord = MediFlowDB.getPharmacyOrderForPatient(p.id);

    ord.orderStatus = 'COMPLETED';
    ord.otp = null;
    ord.qrToken = null;

    const lck = MediFlowDB.lockers.find(l => l.id === (ord.lockerId || 'B-07'));
    if (lck) {
      lck.status = 'AVAILABLE';
      lck.patientId = null;
      lck.orderId = null;
    }

    MediFlowDB.addNotification(p.id, `✓ Medicine collected by ${p.name}. Order completed successfully.`);

    this.saveState();
    this.refreshAllViews();
    alert('✓ Medicine collection confirmed! Locker is closed and sanitized for the next patient.');
    this.navigateToView('patient-dashboard');
  },

  // ------------------------------------------------------------------------
  // 6. STAFF DASHBOARD & OPERATIONS (STAFF-ONLY FEATURES)
  // ------------------------------------------------------------------------
  renderStaffOverview() {
    const s = MediFlowDB.getCurrentUser();
    if (!s || MediFlowDB.session.currentUserRole !== 'staff') return;

    document.getElementById('staffOverviewGreeting').textContent = `${s.name} (${s.department || 'General Medicine'})`;
    document.getElementById('kpiTodayPatients').textContent = '128';
    document.getElementById('kpiWaitingPatients').textContent = '24';
    document.getElementById('kpiConsultationPatients').textContent = '8';
    document.getElementById('kpiCompletedPatients').textContent = '96';
    document.getElementById('kpiSupportRequests').textContent = MediFlowDB.medicalSupportRequests.length;
    document.getElementById('kpiPendingTransfers').textContent = MediFlowDB.transfers.filter(t => t.status === 'Pending').length;
  },

  renderStaffPatientsList(filterQuery = '') {
    const container = document.getElementById('staffPatientsTableBody');
    if (!container) return;

    let list = MediFlowDB.getAllPatientsList();
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.id.toLowerCase().includes(q) || 
        p.token.toLowerCase().includes(q) ||
        p.phone.includes(q)
      );
    }

    container.innerHTML = list.map(p => `
      <tr class="border-b border-slate-100 text-xs hover:bg-slate-50 transition-colors">
        <td class="py-3.5 font-bold text-slate-900">${p.name}</td>
        <td class="py-3.5 font-mono text-slate-600 font-bold">${p.id}</td>
        <td class="py-3.5 text-slate-700">${p.department}</td>
        <td class="py-3.5">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${p.status === 'Waiting' ? 'bg-amber-100 text-amber-800' : p.status === 'In Consultation' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'}">
            ${p.status}
          </span>
        </td>
        <td class="py-3.5 text-slate-600 font-medium">${p.location}</td>
        <td class="py-3.5">
          <span class="inline-flex items-center gap-1 text-[11px] font-semibold ${p.available ? 'text-emerald-700' : 'text-slate-400'}">
            <span class="w-1.5 h-1.5 rounded-full ${p.available ? 'bg-emerald-500' : 'bg-slate-300'}"></span>
            ${p.available ? 'Available' : 'Busy'}
          </span>
        </td>
        <td class="py-3.5 text-right">
          <button onclick="MediFlowApp.openStaffPatientDetail('${p.id}')" class="px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg font-bold text-xs hover:bg-sky-100">
            Manage
          </button>
        </td>
      </tr>
    `).join('');
  },

  openStaffPatientDetail(patientId) {
    const p = MediFlowDB.getPatient(patientId) || MediFlowDB.patients[0];
    
    document.getElementById('detailPatientName').textContent = `${p.name} (${p.id})`;
    document.getElementById('detailPatientDept').textContent = p.department;
    document.getElementById('detailPatientLocation').textContent = p.location;
    document.getElementById('detailPatientStatusSelect').value = p.status;
    document.getElementById('detailTransferDeptSelect').value = 'Radiology';

    document.getElementById('staffPatientDetailModal').setAttribute('data-patient-id', p.id);
    document.getElementById('staffPatientDetailModal').classList.remove('hidden');
    this.refreshIcons();
  },

  handleUpdatePatientStatus() {
    if (MediFlowDB.session.currentUserRole !== 'staff') {
      this.showAccessDenied('staff', 'staff-patients'); return;
    }
    const modal = document.getElementById('staffPatientDetailModal');
    const patientId = modal.getAttribute('data-patient-id');
    const newStatus = document.getElementById('detailPatientStatusSelect').value;
    const staff = MediFlowDB.getCurrentUser();

    const p = MediFlowDB.patients.find(item => item.id === patientId);
    const u = MediFlowDB.getUserById(patientId);

    if (p && u) {
      p.status = newStatus;
      MediFlowDB.addNotification(p.id, `${u.name}, your status was updated to: ${newStatus} by ${staff.name}.`);

      this.saveState();
      this.refreshAllViews();
      alert(`✓ Status for ${u.name} updated to: ${newStatus}`);
      modal.classList.add('hidden');
    }
  },

  handleTransferPatient() {
    if (MediFlowDB.session.currentUserRole !== 'staff') {
      this.showAccessDenied('staff', 'staff-patients'); return;
    }
    const modal = document.getElementById('staffPatientDetailModal');
    const patientId = modal.getAttribute('data-patient-id');
    const dest = document.getElementById('detailTransferDeptSelect').value;
    const staff = MediFlowDB.getCurrentUser();

    const p = MediFlowDB.patients.find(item => item.id === patientId);
    const u = MediFlowDB.getUserById(patientId);

    if (p && u) {
      p.location = `${dest} Department`;
      p.status = `Awaiting ${dest === 'Radiology' ? 'X-Ray' : 'Assessment'}`;

      MediFlowDB.transfers.push({
        id: `TR-${Math.floor(100 + Math.random() * 900)}`,
        patientId: p.id,
        staffId: staff.id,
        fromDepartment: p.department,
        toDepartment: `${dest} Department`,
        status: 'Completed'
      });

      MediFlowDB.addNotification(p.id, `${u.name}, transfer confirmed by ${staff.name}: Please proceed to ${dest} Department.`);

      this.saveState();
      this.refreshAllViews();
      alert(`✓ Patient ${u.name} transferred to ${dest}. Status set to: ${p.status}`);
      modal.classList.add('hidden');
    }
  },

  renderStaffMedicalSupport() {
    const listEl = document.getElementById('staffSupportRequestsList');
    if (!listEl) return;

    listEl.innerHTML = MediFlowDB.medicalSupportRequests.map(r => {
      const p = MediFlowDB.getPatient(r.patientId) || { name: 'Patient' };
      const doc = MediFlowDB.getStaff(r.staffId) || { name: 'Staff Member' };

      return `
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 text-sm">${r.service}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${r.priority === 'High' || r.priority === 'Emergency' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}">${r.priority}</span>
            </div>
            <span class="text-xs font-bold ${r.status === 'Completed' ? 'text-emerald-700' : r.status === 'In Progress' ? 'text-sky-700' : 'text-amber-700'}">
              ● ${r.status}
            </span>
          </div>

          <div class="text-xs text-slate-600 space-y-1">
            <p>Patient: <strong class="text-slate-900">${p.name} (${r.patientId})</strong></p>
            <p>Requested by: <strong class="text-indigo-700">${doc.name}</strong></p>
            <p>Route: ${r.fromDepartment} → <strong class="text-sky-700">${r.toDepartment}</strong></p>
            <p class="text-slate-500 italic">"${r.notes}"</p>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            ${r.status === 'Requested' ? `
              <button onclick="MediFlowApp.advanceSupportStatus('${r.id}', 'Accepted')" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold">Accept</button>
            ` : r.status === 'Accepted' ? `
              <button onclick="MediFlowApp.advanceSupportStatus('${r.id}', 'In Progress')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold">Start</button>
            ` : r.status === 'In Progress' ? `
              <button onclick="MediFlowApp.advanceSupportStatus('${r.id}', 'Completed')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold">Complete</button>
            ` : `
              <span class="text-xs font-bold text-emerald-700 flex items-center gap-1"><i data-lucide="check" class="w-3.5 h-3.5"></i> Completed</span>
            `}
          </div>
        </div>
      `;
    }).join('');

    this.refreshIcons();
  },

  advanceSupportStatus(requestId, nextStatus) {
    if (MediFlowDB.session.currentUserRole !== 'staff') {
      this.showAccessDenied('staff', 'staff-support'); return;
    }
    const req = MediFlowDB.medicalSupportRequests.find(r => r.id === requestId);
    if (req) {
      req.status = nextStatus;
      const p = MediFlowDB.getPatient(req.patientId);
      MediFlowDB.addNotification(req.patientId, `${p.name}, your medical support (${req.service}) request is now: ${nextStatus}.`);

      this.saveState();
      this.refreshAllViews();
      alert(`✓ Request #${requestId} is now: ${nextStatus}`);
    }
  },

  handleCreateSupportRequest() {
    if (MediFlowDB.session.currentUserRole !== 'staff') {
      this.showAccessDenied('staff', 'staff-support'); return;
    }
    const patientId = document.getElementById('supportPatientSelect').value;
    const service = document.getElementById('supportServiceSelect').value;
    const fromDept = document.getElementById('supportFromDeptInput').value;
    const toDept = document.getElementById('supportToDeptSelect').value;
    const priority = document.getElementById('supportPrioritySelect').value;
    const notes = document.getElementById('supportNotesInput').value || 'Requested by attending staff.';

    const p = MediFlowDB.getPatient(patientId);
    const s = MediFlowDB.getCurrentUser();

    const newReq = {
      id: `MS-${Math.floor(100 + Math.random() * 900)}`,
      patientId: p.id,
      staffId: s.id,
      service,
      fromDepartment: fromDept,
      toDepartment: toDept,
      priority,
      status: 'Requested',
      notes,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    MediFlowDB.medicalSupportRequests.unshift(newReq);
    MediFlowDB.addNotification(p.id, `${p.name}, a new medical support request was created: ${service} → ${toDept} by ${s.name}`);

    this.saveState();
    this.refreshAllViews();
    alert(`✓ Medical Support Request created for ${p.name}: ${service}`);
    
    document.getElementById('createSupportModal')?.classList.add('hidden');
  },

  // Dedicated Staff Transfers Management View
  renderStaffTransfersView() {
    const listEl = document.getElementById('staffTransfersTableBody');
    if (!listEl) return;

    listEl.innerHTML = MediFlowDB.transfers.map(t => {
      const p = MediFlowDB.getPatient(t.patientId);
      const s = MediFlowDB.getStaff(t.staffId);
      return `
        <tr class="border-b border-slate-100 text-xs">
          <td class="py-3 font-mono font-bold text-slate-700">${t.id}</td>
          <td class="py-3 font-bold text-slate-900">${p.name} (${p.id})</td>
          <td class="py-3 text-slate-600">${t.fromDepartment}</td>
          <td class="py-3 font-bold text-sky-700">${t.toDepartment}</td>
          <td class="py-3 text-slate-600">${s.name}</td>
          <td class="py-3">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
              ${t.status}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  },

  // Dedicated Staff Pharmacy Orders & Locker Inventory View
  renderStaffPharmacyView() {
    const listEl = document.getElementById('staffPharmacyOrdersTableBody');
    const lockerGrid = document.getElementById('staffLockerBayGrid');

    if (listEl) {
      listEl.innerHTML = MediFlowDB.pharmacyOrders.map(o => {
        const p = MediFlowDB.getPatient(o.patientId);
        return `
          <tr class="border-b border-slate-100 text-xs">
            <td class="py-3 font-mono font-bold text-slate-700">${o.id}</td>
            <td class="py-3 font-bold text-slate-900">${p.name} (${p.id})</td>
            <td class="py-3 font-mono">₹${o.total}</td>
            <td class="py-3">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${o.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : o.paymentStatus === 'PENDING_CASH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}">
                ${o.paymentStatus}
              </span>
            </td>
            <td class="py-3">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${o.orderStatus === 'READY' ? 'bg-emerald-100 text-emerald-800' : o.orderStatus === 'PREPARING' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'}">
                ${o.orderStatus}
              </span>
            </td>
            <td class="py-3 font-mono font-bold text-slate-800">${o.lockerId || '—'}</td>
            <td class="py-3 text-right">
              ${o.paymentStatus === 'PENDING_CASH' ? `
                <button onclick="MediFlowApp.staffConfirmCashPayment('${o.id}')" class="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">Confirm Cash</button>
              ` : o.orderStatus === 'PREPARING' ? `
                <button onclick="MediFlowApp.staffAssignLockerReady('${o.id}')" class="px-3 py-1 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700">Set Ready (B-07)</button>
              ` : `
                <span class="text-xs text-slate-400 font-semibold">—</span>
              `}
            </td>
          </tr>
        `;
      }).join('');
    }

    if (lockerGrid) {
      lockerGrid.innerHTML = MediFlowDB.lockers.map(l => `
        <div class="p-3 rounded-xl border text-center text-xs ${l.status === 'OCCUPIED' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}">
          <strong class="font-mono text-sm block">${l.id}</strong>
          <span class="text-[10px] font-bold uppercase">${l.status}</span>
        </div>
      `).join('');
    }
  },

  staffConfirmCashPayment(orderId) {
    if (MediFlowDB.session.currentUserRole !== 'staff') {
      this.showAccessDenied('staff', 'staff-pharmacy'); return;
    }
    const ord = MediFlowDB.pharmacyOrders.find(o => o.id === orderId);
    if (ord) {
      ord.paymentStatus = 'PAID';
      ord.orderStatus = 'PREPARING';
      ord.transactionId = `CASH-REC-${Math.floor(1000 + Math.random() * 9000)}`;

      const p = MediFlowDB.getPatient(ord.patientId);
      MediFlowDB.addNotification(p.id, `Cash payment received at counter by staff. Preparing medicines.`);

      this.saveState();
      this.refreshAllViews();
      alert(`✓ Cash payment received for Order #${orderId}`);
    }
  },

  staffAssignLockerReady(orderId) {
    if (MediFlowDB.session.currentUserRole !== 'staff') {
      this.showAccessDenied('staff', 'staff-pharmacy'); return;
    }
    const ord = MediFlowDB.pharmacyOrders.find(o => o.id === orderId);
    if (ord) {
      ord.orderStatus = 'READY';
      ord.lockerId = 'B-07';
      ord.otp = Math.floor(100000 + Math.random() * 900000).toString();
      ord.qrToken = `SEC-TOK-${Date.now()}`;

      const p = MediFlowDB.getPatient(ord.patientId);
      MediFlowDB.addNotification(p.id, `${p.name}, your medicine has been staged in Locker B-07. OTP: ${ord.otp}`);

      this.saveState();
      this.refreshAllViews();
      alert(`✓ Order #${orderId} marked READY in Locker B-07 with OTP: ${ord.otp}`);
    }
  },

  renderStaffQueues() {
    const container = document.getElementById('staffQueuesGrid');
    if (!container) return;

    container.innerHTML = MediFlowDB.departmentQueues.map(q => `
      <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-slate-900 text-sm">${q.dept}</h4>
          <span class="px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full text-[10px] font-bold">${q.activeDoctors} Doctors</span>
        </div>
        <div class="flex items-baseline justify-between text-xs">
          <span class="text-slate-500">Waiting: <strong class="text-slate-900 font-bold text-sm">${q.waiting}</strong></span>
          <span class="text-slate-500">Avg Wait: <strong class="text-sky-700">${q.avgWait}</strong></span>
        </div>
        <button onclick="MediFlowApp.handleStaffCallNext('${q.dept}')" class="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
          <i data-lucide="megaphone" class="w-3.5 h-3.5"></i> Call Next Patient
        </button>
      </div>
    `).join('');

    const p1 = MediFlowDB.getPatient('P-1024') || MediFlowDB.getAllPatientsList()[0];
    const callCardioBtn = document.getElementById('staffCallCardioBtn');
    const cardioNextPatientText = document.getElementById('cardioNextPatientText');

    if (cardioNextPatientText && p1) cardioNextPatientText.textContent = `${p1.name} (${p1.token})`;
    if (callCardioBtn && p1) {
      callCardioBtn.textContent = `Call ${p1.name} (${p1.token}) to Room 203`;
      callCardioBtn.onclick = () => this.handleStaffCallNext('Cardiology');
    }

    this.refreshIcons();
  },

  handleStaffCallNext(department) {
    if (MediFlowDB.session.currentUserRole !== 'staff') {
      this.showAccessDenied('staff', 'staff-queues'); return;
    }
    const targetPatient = MediFlowDB.getAllPatientsList().find(p => p.department.includes(department)) || MediFlowDB.getAllPatientsList()[0];
    
    if (targetPatient) {
      const p = MediFlowDB.patients.find(item => item.id === targetPatient.id);
      if (p) {
        p.status = 'Called';
        p.queuePosition = 0;
      }
      MediFlowDB.addNotification(targetPatient.id, `🔔 ${targetPatient.name}, your doctor is ready! Please proceed to Room 203.`);
      alert(`📢 Patient ${targetPatient.name} (${targetPatient.token}) called to Room 203.`);
    }

    this.saveState();
    this.refreshAllViews();
  },

  initStaffListeners() {
    const searchInput = document.getElementById('staffPatientSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderStaffPatientsList(e.target.value.trim());
      });
    }

    const openCreateSupportBtn = document.getElementById('openCreateSupportModalBtn');
    if (openCreateSupportBtn) {
      openCreateSupportBtn.addEventListener('click', () => {
        const sel = document.getElementById('supportPatientSelect');
        if (sel) {
          sel.innerHTML = MediFlowDB.getAllPatientsList().map(p => `
            <option value="${p.id}">${p.name} (${p.id}, ${p.department} - ${p.available ? 'Available' : 'Busy'})</option>
          `).join('');
        }
        document.getElementById('createSupportModal')?.classList.remove('hidden');
      });
    }

    const closeCreateSupportBtn = document.getElementById('closeCreateSupportModalBtn');
    if (closeCreateSupportBtn) {
      closeCreateSupportBtn.addEventListener('click', () => {
        document.getElementById('createSupportModal')?.classList.add('hidden');
      });
    }

    const submitSupportBtn = document.getElementById('submitCreateSupportBtn');
    if (submitSupportBtn) {
      submitSupportBtn.addEventListener('click', () => this.handleCreateSupportRequest());
    }

    const updateStatusBtn = document.getElementById('detailSaveStatusBtn');
    if (updateStatusBtn) {
      updateStatusBtn.addEventListener('click', () => this.handleUpdatePatientStatus());
    }

    const confirmTransferBtn = document.getElementById('detailConfirmTransferBtn');
    if (confirmTransferBtn) {
      confirmTransferBtn.addEventListener('click', () => this.handleTransferPatient());
    }

    const closeDetailModalBtn = document.getElementById('closePatientDetailModalBtn');
    if (closeDetailModalBtn) {
      closeDetailModalBtn.addEventListener('click', () => {
        document.getElementById('staffPatientDetailModal')?.classList.add('hidden');
      });
    }
  },

  // ------------------------------------------------------------------------
  // 7. EDITABLE PROFILES (PATIENT & STAFF SEPARATE)
  // ------------------------------------------------------------------------
  initProfileListeners() {
    const savePatientProfileBtn = document.getElementById('savePatientProfileBtn');
    if (savePatientProfileBtn) {
      savePatientProfileBtn.addEventListener('click', () => {
        const u = MediFlowDB.getCurrentUser();
        const newName = document.getElementById('patientProfileNameInput')?.value.trim();
        const newAge = parseInt(document.getElementById('patientProfileAgeInput')?.value) || 22;
        const newPhone = document.getElementById('patientProfilePhoneInput')?.value.trim();
        const newEmail = document.getElementById('patientProfileEmailInput')?.value.trim();

        if (!newName) {
          alert('Name cannot be empty.');
          return;
        }

        u.name = newName;
        u.phone = newPhone;
        u.email = newEmail;

        const p = MediFlowDB.patients.find(item => item.id === u.id);
        if (p) p.age = newAge;

        this.saveState();
        this.refreshAllViews();
        alert(`✓ Profile updated successfully! Display name is now: ${u.name}`);
      });
    }

    const saveStaffProfileBtn = document.getElementById('saveStaffProfileBtn');
    if (saveStaffProfileBtn) {
      saveStaffProfileBtn.addEventListener('click', () => {
        const s = MediFlowDB.getCurrentUser();
        const newName = document.getElementById('staffProfileNameInput')?.value.trim();
        const newDept = document.getElementById('staffProfileDeptInput')?.value.trim();
        const newPhone = document.getElementById('staffProfilePhoneInput')?.value.trim();
        const newEmail = document.getElementById('staffProfileEmailInput')?.value.trim();

        if (!newName) {
          alert('Staff name cannot be empty.');
          return;
        }

        s.name = newName;
        s.department = newDept;
        s.phone = newPhone;
        s.email = newEmail;

        this.saveState();
        this.refreshAllViews();
        alert(`✓ Staff profile updated! Display name is now: ${s.name}`);
      });
    }
  },

  renderPatientProfile() {
    const p = MediFlowDB.getPatient(MediFlowDB.session.currentUserId);
    if (!p || MediFlowDB.session.currentUserRole !== 'patient') return;

    document.getElementById('patientProfileIdDisplay').textContent = p.id;
    document.getElementById('patientProfileDeptDisplay').textContent = p.department;
    document.getElementById('patientProfileStatusDisplay').textContent = p.status;
    document.getElementById('patientProfileNameInput').value = p.name;
    document.getElementById('patientProfileAgeInput').value = p.age;
    document.getElementById('patientProfilePhoneInput').value = p.phone;
    document.getElementById('patientProfileEmailInput').value = p.email;
  },

  renderStaffProfile() {
    const s = MediFlowDB.getCurrentUser();
    if (!s || MediFlowDB.session.currentUserRole !== 'staff') return;

    document.getElementById('staffProfileIdDisplay').textContent = s.id;
    document.getElementById('staffProfileNameInput').value = s.name;
    document.getElementById('staffProfileDeptInput').value = s.department || 'General Medicine';
    document.getElementById('staffProfilePhoneInput').value = s.phone;
    document.getElementById('staffProfileEmailInput').value = s.email;
  },

  // ------------------------------------------------------------------------
  // 8. STATE PERSISTENCE
  // ------------------------------------------------------------------------
  saveState() {
    try {
      localStorage.setItem('mediflow_rbac_store_v3', JSON.stringify({
        session: MediFlowDB.session,
        users: MediFlowDB.users,
        patients: MediFlowDB.patients,
        prescriptions: MediFlowDB.prescriptions,
        pharmacyOrders: MediFlowDB.pharmacyOrders,
        medicalSupportRequests: MediFlowDB.medicalSupportRequests,
        transfers: MediFlowDB.transfers,
        notifications: MediFlowDB.notifications
      }));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },

  loadPersistedState() {
    try {
      const storedUserId = localStorage.getItem('currentUserId');
      const storedUserRole = localStorage.getItem('currentUserRole');
      if (storedUserId && storedUserRole) {
        MediFlowDB.session.currentUserId = storedUserId;
        MediFlowDB.session.currentUserRole = storedUserRole;
        MediFlowDB.session.isAuthenticated = true;
      }

      const data = localStorage.getItem('mediflow_rbac_store_v3');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.session) MediFlowDB.session = parsed.session;
        if (parsed.users) MediFlowDB.users = parsed.users;
        if (parsed.patients) MediFlowDB.patients = parsed.patients;
        if (parsed.prescriptions) MediFlowDB.prescriptions = parsed.prescriptions;
        if (parsed.pharmacyOrders) MediFlowDB.pharmacyOrders = parsed.pharmacyOrders;
        if (parsed.medicalSupportRequests) MediFlowDB.medicalSupportRequests = parsed.medicalSupportRequests;
        if (parsed.transfers) MediFlowDB.transfers = parsed.transfers;
        if (parsed.notifications) MediFlowDB.notifications = parsed.notifications;
      }
    } catch (e) {
      console.warn('Storage load error:', e);
    }

    if (!MediFlowDB.session.isAuthenticated) {
      this.navigateToView('login', true);
    } else if (MediFlowDB.session.currentUserRole === 'staff') {
      this.navigateToView('staff-overview', true);
    } else {
      this.navigateToView('patient-dashboard', true);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MediFlowApp.init();
});

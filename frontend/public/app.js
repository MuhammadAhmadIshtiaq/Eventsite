// NASCON '26 Frontend Application Logic
const API_BASE = window.location.hostname === 'localhost' && window.location.port === '3000'
  ? 'http://localhost:5000/api'
  : '/api';

// Fallback seed competitions in case backend DB is warming up
const DEFAULT_EVENTS = [
  {
    id: 1,
    title: 'Speed Programming Battle',
    category: 'Coding',
    description: 'Intense competitive programming contest testing algorithms, data structures, and algorithmic speed in C++, Java, and Python.',
    team_size_min: 1,
    team_size_max: 3,
    registration_fee: '1500.00',
    prize_pool: 'PKR 75,000',
    venue: 'Computing Lab 3 & 4',
    event_date: 'Day 1 - 10:00 AM'
  },
  {
    id: 2,
    title: 'Web & App Hackathon',
    category: 'Development',
    description: '24-hour sprint to build a full-stack production-ready software solution addressing real-world university challenges.',
    team_size_min: 2,
    team_size_max: 4,
    registration_fee: '2500.00',
    prize_pool: 'PKR 100,000',
    venue: 'Incubation Center',
    event_date: 'Day 1 - 02:00 PM'
  },
  {
    id: 3,
    title: 'Capture The Flag (CTF)',
    category: 'Cyber Security',
    description: 'Jeopardy & attack-defense cybersecurity challenges spanning web exploitation, reverse engineering, cryptography, and forensics.',
    team_size_min: 1,
    team_size_max: 3,
    registration_fee: '1800.00',
    prize_pool: 'PKR 60,000',
    venue: 'Network Security Lab',
    event_date: 'Day 2 - 09:30 AM'
  },
  {
    id: 4,
    title: 'RoboRace & Maze Runner',
    category: 'Robotics',
    description: 'Autonomous and manual micro-robot navigation across high-complexity obstacle courses, ramps, and timed tracks.',
    team_size_min: 1,
    team_size_max: 4,
    registration_fee: '2000.00',
    prize_pool: 'PKR 80,000',
    venue: 'Central Gymnasium Arena',
    event_date: 'Day 2 - 11:00 AM'
  },
  {
    id: 5,
    title: 'AI & Data Science Challenge',
    category: 'Artificial Intelligence',
    description: 'Build, fine-tune, and pitch state-of-the-art predictive ML models and GenAI applications on masked industry datasets.',
    team_size_min: 1,
    team_size_max: 3,
    registration_fee: '2000.00',
    prize_pool: 'PKR 70,000',
    venue: 'Data Science Research Lab',
    event_date: 'Day 2 - 01:00 PM'
  },
  {
    id: 6,
    title: 'E-Sports Arena (Valorant & FIFA)',
    category: 'Gaming',
    description: 'Collegiate multi-platform e-sports tournament competing in double-elimination brackets for the championship trophy.',
    team_size_min: 1,
    team_size_max: 5,
    registration_fee: '2500.00',
    prize_pool: 'PKR 50,000',
    venue: 'Auditorium Hall',
    event_date: 'Day 3 - 10:00 AM'
  }
];

let allCompetitions = [];
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  checkBackendHealth();
  fetchCompetitions();
  fetchStats();
  initCategoryFilters();
});

// ---------------- Backend Health Check ---------------- //
async function checkBackendHealth() {
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.getElementById('statusText');

  try {
    const healthUrl = window.location.hostname === 'localhost' && window.location.port === '3000'
      ? 'http://localhost:5000/health'
      : '/health';
    const res = await fetch(healthUrl, { method: 'GET' });
    if (res.ok) {
      statusDot.className = 'status-dot online';
      statusText.textContent = 'Backend Online (3-Tier Connected)';
    } else {
      statusDot.className = 'status-dot';
      statusText.textContent = 'Connecting...';
    }
  } catch (err) {
    statusDot.className = 'status-dot';
    statusText.textContent = 'Frontend Standalone Mode';
  }
}

// ---------------- Competitions Retrieval & Render ---------------- //
async function fetchCompetitions() {
  const grid = document.getElementById('competitionsGrid');
  const eventSelect = document.getElementById('regEvent');

  try {
    const res = await fetch(`${API_BASE}/events`);
    if (res.ok) {
      const data = await res.json();
      allCompetitions = data.events && data.events.length > 0 ? data.events : DEFAULT_EVENTS;
    } else {
      allCompetitions = DEFAULT_EVENTS;
    }
  } catch (err) {
    console.warn('Backend API unreachable, using default competitions list.');
    allCompetitions = DEFAULT_EVENTS;
  }

  renderCompetitions(allCompetitions);
  populateSelectOptions(allCompetitions);
}

function renderCompetitions(events) {
  const grid = document.getElementById('competitionsGrid');
  grid.innerHTML = '';

  if (events.length === 0) {
    grid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">No competitions found for this category.</p>';
    return;
  }

  events.forEach(evt => {
    const card = document.createElement('div');
    card.className = 'competition-card';
    card.innerHTML = `
      <div class="card-top">
        <span class="card-tag">${escapeHtml(evt.category)}</span>
        <h3 class="card-title">${escapeHtml(evt.title)}</h3>
        <p class="card-desc">${escapeHtml(evt.description)}</p>
      </div>

      <div class="card-meta">
        <div class="meta-row">
          <span>Prize Pool:</span>
          <strong class="prize-badge">${escapeHtml(evt.prize_pool || 'Trophy & Certificates')}</strong>
        </div>
        <div class="meta-row">
          <span>Team Size:</span>
          <strong>${evt.team_size_min} - ${evt.team_size_max} Members</strong>
        </div>
        <div class="meta-row">
          <span>Venue & Time:</span>
          <strong>${escapeHtml(evt.venue || 'Campus Lab')} (${escapeHtml(evt.event_date || 'Day 1')})</strong>
        </div>
      </div>

      <div class="card-action">
        <button class="btn btn-outline full-width" onclick="selectEventForRegistration(${evt.id})">
          Register for this Arena
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function populateSelectOptions(events) {
  const select = document.getElementById('regEvent');
  select.innerHTML = '<option value="">-- Choose Competition --</option>';
  events.forEach(evt => {
    const opt = document.createElement('option');
    opt.value = evt.id;
    opt.textContent = `${evt.title} (${evt.category} - Max ${evt.team_size_max} members)`;
    select.appendChild(opt);
  });
}

function selectEventForRegistration(eventId) {
  const select = document.getElementById('regEvent');
  select.value = eventId;
  const regSection = document.getElementById('register-section');
  regSection.scrollIntoView({ behavior: 'smooth' });
}

// ---------------- Category Filtering ---------------- //
function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      if (filter === 'all') {
        renderCompetitions(allCompetitions);
      } else {
        const filtered = allCompetitions.filter(e => e.category.toLowerCase().includes(filter.toLowerCase()));
        renderCompetitions(filtered);
      }
    });
  });
}

// ---------------- Stats Fetching ---------------- //
async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (res.ok) {
      const stats = await res.json();
      if (stats.competitions) document.getElementById('statCompetitions').textContent = stats.competitions;
      if (stats.registrations) document.getElementById('statRegistrations').textContent = `${stats.registrations}+`;
    }
  } catch (err) {
    // Keep fallback static stats
  }
}

// ---------------- Authentication Handling ---------------- //
function initAuth() {
  const token = localStorage.getItem('nascon_token');
  const userJson = localStorage.getItem('nascon_user');

  if (token && userJson) {
    try {
      currentUser = JSON.parse(userJson);
      updateAuthUI(true);
      fetchMyRegistrations();
    } catch (e) {
      logoutUser();
    }
  } else {
    updateAuthUI(false);
  }
}

function updateAuthUI(isLoggedIn) {
  const guestActions = document.getElementById('guestActions');
  const userActions = document.getElementById('userActions');
  const navDashboard = document.getElementById('navDashboard');
  const dashboardSection = document.getElementById('my-dashboard');

  if (isLoggedIn && currentUser) {
    guestActions.style.display = 'none';
    userActions.style.display = 'flex';
    navDashboard.style.display = 'inline-block';
    dashboardSection.style.display = 'block';

    document.getElementById('displayUserName').textContent = currentUser.name;
    document.getElementById('userInitial').textContent = currentUser.name.charAt(0).toUpperCase();

    // Auto-fill leader info in registration form if available
    if (document.getElementById('regLeaderName').value === '') {
      document.getElementById('regLeaderName').value = currentUser.name || '';
      document.getElementById('regLeaderEmail').value = currentUser.email || '';
      document.getElementById('regUniversity').value = currentUser.university || '';
      document.getElementById('regLeaderPhone').value = currentUser.phone || '';
    }
  } else {
    guestActions.style.display = 'flex';
    userActions.style.display = 'none';
    navDashboard.style.display = 'none';
    dashboardSection.style.display = 'none';
  }
}

function openAuthModal(mode) {
  const modal = document.getElementById('authModal');
  modal.style.display = 'flex';
  switchAuthTab(mode);
}

function closeAuthModal() {
  document.getElementById('authModal').style.display = 'none';
  clearFeedback('loginFeedback');
  clearFeedback('signupFeedback');
}

function closeAuthModalOnOutside(e) {
  if (e.target.id === 'authModal') {
    closeAuthModal();
  }
}

function switchAuthTab(tab) {
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');
  const feedback = document.getElementById('loginFeedback');

  btn.disabled = true;
  btn.textContent = 'Authenticating...';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('nascon_token', data.token);
      localStorage.setItem('nascon_user', JSON.stringify(data.user));
      currentUser = data.user;
      showFeedback(feedback, 'Sign in successful!', 'success');
      setTimeout(() => {
        closeAuthModal();
        updateAuthUI(true);
        fetchMyRegistrations();
      }, 700);
    } else {
      showFeedback(feedback, data.error || 'Failed to sign in', 'error');
    }
  } catch (err) {
    showFeedback(feedback, 'Cannot reach server. Verify backend is running.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

async function handleSignupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const university = document.getElementById('signupUniversity').value;
  const student_id = document.getElementById('signupStudentID').value;
  const btn = document.getElementById('signupBtn');
  const feedback = document.getElementById('signupFeedback');

  btn.disabled = true;
  btn.textContent = 'Creating Account...';

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, university, student_id })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('nascon_token', data.token);
      localStorage.setItem('nascon_user', JSON.stringify(data.user));
      currentUser = data.user;
      showFeedback(feedback, 'Registration successful! Welcome to NASCON.', 'success');
      setTimeout(() => {
        closeAuthModal();
        updateAuthUI(true);
        fetchMyRegistrations();
      }, 700);
    } else {
      showFeedback(feedback, data.error || 'Registration failed', 'error');
    }
  } catch (err) {
    showFeedback(feedback, 'Cannot reach server. Verify backend is running.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

function logoutUser() {
  localStorage.removeItem('nascon_token');
  localStorage.removeItem('nascon_user');
  currentUser = null;
  updateAuthUI(false);
}

// ---------------- Registration Submission ---------------- //
async function handleRegistrationSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('teamRegistrationForm');
  const feedback = document.getElementById('regFeedback');
  const submitBtn = document.getElementById('submitRegBtn');

  const token = localStorage.getItem('nascon_token');
  if (!token) {
    openAuthModal('signup');
    showFeedback(feedback, 'Please Sign In or Create an Account first to confirm your team registration.', 'error');
    return;
  }

  const payload = {
    event_id: parseInt(document.getElementById('regEvent').value, 10),
    team_name: document.getElementById('regTeamName').value,
    leader_name: document.getElementById('regLeaderName').value,
    leader_email: document.getElementById('regLeaderEmail').value,
    leader_phone: document.getElementById('regLeaderPhone').value,
    university: document.getElementById('regUniversity').value,
    members: document.getElementById('regMembers').value
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting Registration...';

  try {
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      showFeedback(feedback, `🎉 Registration Confirmed for team "${payload.team_name}"! See you at NASCON '26.`, 'success');
      form.reset();
      fetchMyRegistrations();
      fetchStats();
      const dash = document.getElementById('my-dashboard');
      if (dash) dash.scrollIntoView({ behavior: 'smooth' });
    } else {
      showFeedback(feedback, data.error || 'Failed to submit registration.', 'error');
    }
  } catch (err) {
    showFeedback(feedback, 'Server communication error. Check backend connection.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm & Submit Registration';
  }
}

// ---------------- User Registration Dashboard ---------------- //
async function fetchMyRegistrations() {
  const token = localStorage.getItem('nascon_token');
  const container = document.getElementById('myRegistrationsContainer');
  if (!token || !container) return;

  try {
    const res = await fetch(`${API_BASE}/registrations/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      const list = data.registrations || [];

      if (list.length === 0) {
        container.innerHTML = '<p class="text-muted">You have not registered for any competitions yet. Select a competition above!</p>';
        return;
      }

      container.innerHTML = '';
      list.forEach(reg => {
        const item = document.createElement('div');
        item.className = 'reg-card';
        item.innerHTML = `
          <div class="reg-info">
            <h4>${escapeHtml(reg.event_title)} (${escapeHtml(reg.event_category)})</h4>
            <p><strong>Team:</strong> ${escapeHtml(reg.team_name)} | <strong>Leader:</strong> ${escapeHtml(reg.leader_name)} (${escapeHtml(reg.leader_phone)})</p>
            <p><strong>Venue:</strong> ${escapeHtml(reg.venue)} | <strong>Date:</strong> ${escapeHtml(reg.event_date)}</p>
          </div>
          <div>
            <span class="badge-confirmed">${escapeHtml(reg.status || 'CONFIRMED')}</span>
          </div>
        `;
        container.appendChild(item);
      });
    }
  } catch (err) {
    console.error('Failed to load user registrations:', err);
  }
}

// ---------------- Utility Helpers ---------------- //
function showFeedback(el, message, type) {
  el.style.display = 'block';
  el.className = `form-feedback ${type}`;
  el.textContent = message;
}

function clearFeedback(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'none';
    el.textContent = '';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

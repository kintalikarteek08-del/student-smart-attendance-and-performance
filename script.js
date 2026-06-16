// Subjects with codes
const SUBJECTS = [
    { code: 'SC', name: 'Science' },
    { code: 'MA', name: 'Maths' },
    { code: 'SS', name: 'Social Studies' },
    { code: 'EN', name: 'English' },
    { code: 'TE', name: 'Telugu' },
    { code: 'HI', name: 'Hindi' },
    { code: 'DR', name: 'Drawing' }
];

// User credentials and roles
const USERS = [
    { username: 'classteacher', password: 'class123', role: 'class' },
    { username: 'sci_teacher', password: 'sci123', role: 'subject', subjects: ['SC'] },
    { username: 'math_teacher', password: 'math123', role: 'subject', subjects: ['MA'] },
    { username: 'ss_teacher', password: 'ss123', role: 'subject', subjects: ['SS'] },
    { username: 'tel_teacher', password: 'tel123', role: 'subject', subjects: ['TE'] },
    { username: 'en_teacher', password: 'en123', role: 'subject', subjects: ['EN'] },
    { username: 'dr_teacher', password: 'dr123', role: 'subject', subjects: ['DR'] },
    { username: 'hi_teacher', password: 'hi123', role: 'subject', subjects: ['HI'] }
];

const API_BASE = '/api';

const STUDENT_ROLLS = [1, 2];
const STUDENT_NAMES = {
    1: 'Rahul',
    2: 'Anita'
};
const STUDENT_IDS = {
    1: null,
    2: null
};

let currentSubject = null;

function getCurrentUser() {
    const user = localStorage.getItem('user');
    if (!user) return null;

    try {
        return JSON.parse(user);
    } catch (error) {
        localStorage.removeItem('user');
        return null;
    }
}

async function apiGet(path) {
    try {
        const resp = await fetch(`${API_BASE}${path}`);
        if (!resp.ok) throw new Error(resp.statusText);
        return await resp.json();
    } catch (err) {
        console.warn('API get fail', path, err);
        return null;
    }
}

async function apiPost(path, body) {
    try {
        const resp = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) throw new Error(await resp.text());
        return await resp.json();
    } catch (err) {
        console.warn('API post fail', path, err);
        return null;
    }
}

async function apiDelete(path) {
    try {
        const resp = await fetch(`${API_BASE}${path}`, {
            method: 'DELETE'
        });
        if (!resp.ok) throw new Error(await resp.text());
        return await resp.json();
    } catch (err) {
        console.warn('API delete fail', path, err);
        return null;
    }
}

function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getWeekStartKey() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diff);
    return monday.toISOString().slice(0, 10);
}

function initSubjectSelect() {
    const select = document.getElementById('subjectSelect');
    select.innerHTML = `<option value="">--Select Subject--</option>`;

    const user = getCurrentUser();
    let availableSubjects = SUBJECTS;

    if (user && user.role === 'subject') {
        availableSubjects = SUBJECTS.filter(sub =>
            user.subjects.includes(sub.code)
        );
    }

    availableSubjects.forEach(subj => {
        const option = document.createElement('option');
        option.value = subj.code;
        option.textContent = subj.name;
        select.appendChild(option);
    });
}

function ensureTodayAttendanceInit() {
    const today = todayKey();
    const savedDate = localStorage.getItem('attendance_date');

    if (savedDate !== today) {
        SUBJECTS.forEach(subj => {
            STUDENT_ROLLS.forEach(roll => {
                const key = `attendance_${subj.code}_${roll}_${today}`;
                if (!localStorage.getItem(key)) {
                    localStorage.setItem(key, '-');
                }
            });
        });

        localStorage.setItem('attendance_date', today);
    }
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

// Add slide out animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
`;
document.head.appendChild(style);

// Enhanced login with loading state
function login() {
    const button = document.querySelector('#loginSection .btn');
    const originalText = button.textContent;

    // Add loading state
    button.classList.add('loading');
    button.textContent = 'Logging in...';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    setTimeout(() => {
        const user = USERS.find(
            u => u.username === username && u.password === password
        );

        if (!user) {
            document.getElementById('loginMsg').innerText = 'Invalid Login';
            document.getElementById('loginMsg').className = 'error-msg';
            showToast('Invalid login credentials', 'error');
            button.classList.remove('loading');
            button.textContent = originalText;
            return;
        }

        // Success animation
        document.body.classList.add('dashboard');
        document.getElementById('loginSection').style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(user));

            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('dashboardSection').style.display = 'block';
            document.getElementById('dashboardSection').style.animation = 'slideIn 0.5s ease-out';

            loadDashboard();
            showToast('Welcome back, ' + user.username + '!', 'success');
        }, 300);

        button.classList.remove('loading');
        button.textContent = originalText;
    }, 1000); // Simulate loading time
}

function logout() {
    localStorage.removeItem('teacherLoggedIn');
    localStorage.removeItem('teacherUsername');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

async function loadDashboard() {
    ensureTodayAttendanceInit();
    initSubjectSelect();

    const user = getCurrentUser();

    let firstCode = SUBJECTS[0].code;

    if (user && user.role === 'subject') {
        firstCode = user.subjects[0];
    }

    document.getElementById('subjectSelect').value = firstCode;

    // Try fetch student list from backend API, fallback to local list
    await loadStudentsFromBackend();

    loadSubjectData();
}

async function loadStudentsFromBackend() {
    const students = await apiGet('/students');
    if (!students) return;

    STUDENT_ROLLS.length = 0;
    Object.keys(STUDENT_NAMES).forEach(k => delete STUDENT_NAMES[k]);

    students.forEach(student => {
        STUDENT_ROLLS.push(student.roll);
        STUDENT_NAMES[student.roll] = student.name;
        STUDENT_IDS[student.roll] = student._id;
    });

    localStorage.setItem('student_rolls', JSON.stringify(STUDENT_ROLLS));
    localStorage.setItem('student_names', JSON.stringify(STUDENT_NAMES));
    loadStudentsTable();
}

function updateDateDisplays() {
    if (!currentSubject) return;

    document.getElementById('attendanceDate').innerText =
        formatDate(todayKey());

    const weekStart = getWeekStartKey();
    document.getElementById('performanceDate').innerText =
        `Week Starting: ${formatDate(weekStart)}`;
}

async function loadSubjectData() {
    const code = document.getElementById('subjectSelect').value;
    if (!code) return;

    const today = todayKey();

    currentSubject = SUBJECTS.find(s => s.code === code);

    document.getElementById('attendanceTitle').innerText =
        `Attendance - ${currentSubject.name}`;

    document.getElementById('performanceTitle').innerText =
        `Performance - ${currentSubject.name}`;

    updateDateDisplays();

    await loadAttendanceTable();
    loadPerformanceTable();
    loadReportTable();

    updateClassPercent();
    showAttendance();
}

async function loadAttendanceTable() {
    const table = document.getElementById('attendanceTable');

    // Clear existing rows except header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    const today = todayKey();
    
    // Fetch existing attendance records from the database
    const allAttendance = await apiGet('/attendance') || [];
    const todayRecords = allAttendance.filter(record => 
        record.subject === currentSubject.name && 
        new Date(record.date).toISOString().slice(0, 10) === today
    );

    STUDENT_ROLLS.forEach(roll => {
        const row = table.insertRow();
        row.insertCell(0).innerText = roll;
        row.insertCell(1).innerText = STUDENT_NAMES[roll];

        const record = todayRecords.find(r => r.student && r.student.roll === roll);
        const status = record ? record.status : '-';

        const statusCell = row.insertCell(2);
        statusCell.innerText = status;
        statusCell.id = `status-${roll}`;

        const actionCell = row.insertCell(3);
        actionCell.innerHTML = `
            <button onclick="markAttendance(${roll},'Present')" class="btn small-btn">Present</button>
            <button onclick="markAttendance(${roll},'Absent')" class="btn small-btn">Absent</button>
        `;
    });
}

function loadPerformanceTable() {
    const table = document.getElementById('performanceTable');

    // Clear existing rows except header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    const weekStart = getWeekStartKey();

    STUDENT_ROLLS.forEach(roll => {
        const row = table.insertRow();
        row.insertCell(0).innerText = roll;
        row.insertCell(1).innerText = STUDENT_NAMES[roll];

        const marks = localStorage.getItem(
            `marks_${currentSubject.code}_${roll}_${weekStart}`
        ) || '-';

        row.insertCell(2).innerText = marks;
        row.insertCell(2).id = `perf-${roll}`;
    });
}

function loadReportTable() {
    const table = document.getElementById('reportTable');

    // Clear existing rows except header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    STUDENT_ROLLS.forEach(roll => {
        const row = table.insertRow();
        row.insertCell(0).innerText = roll;
        row.insertCell(1).innerText = STUDENT_NAMES[roll];

        // Calculate attendance percentage for this student
        const percent = calculateStudentAttendancePercent(roll);
        row.insertCell(2).innerText = percent + '%';

        const status = percent >= 75 ? 'Good' : percent >= 60 ? 'Average' : 'Poor';
        row.insertCell(3).innerText = status;
    });
}

function calculateStudentAttendancePercent(roll) {
    if (!currentSubject) return 0;

    let totalDays = 0;
    let presentDays = 0;

    // Check last 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().slice(0, 10);

        const status = localStorage.getItem(
            `attendance_${currentSubject.code}_${roll}_${dateKey}`
        );

        if (status) {
            totalDays++;
            if (status === 'Present') presentDays++;
        }
    }

    if (totalDays === 0) return 0;
    return Math.round((presentDays / totalDays) * 100);
}

async function markAttendance(roll, status) {
    if (!currentSubject) return;

    const studentId = STUDENT_IDS[roll];
    if (!studentId) {
        showToast('Student data not synced with database. Please refresh.', 'error');
        return;
    }

    const today = todayKey();
    const statusCell = document.getElementById(`status-${roll}`);
    const buttons = statusCell.parentElement.querySelectorAll('.small-btn');

    // Add loading state to buttons
    buttons.forEach(btn => btn.classList.add('loading'));

    // Save to Backend Database
    const result = await apiPost('/attendance', {
        studentId,
        subject: currentSubject.name,
        date: today,
        status
    });

    if (result) {
        localStorage.setItem(
            `attendance_${currentSubject.code}_${roll}_${today}`,
            status
        );

        // Update status with animation
        statusCell.textContent = status;
        statusCell.className = status === 'Present' ? 'status-present' : 'status-absent';

        // Add bounce animation
        statusCell.style.animation = 'bounce 0.5s ease-out';

        updateClassPercent();

        // Show toast notification
        const studentName = STUDENT_NAMES[roll];
        showToast(`${studentName} marked as ${status}`, 'success', 2000);

        // Remove loading state
        buttons.forEach(btn => btn.classList.remove('loading'));

        // Reset animation
        setTimeout(() => {
            statusCell.style.animation = '';
        }, 500);
    } else {
        showToast('Failed to save attendance to database', 'error');
    }
    buttons.forEach(btn => btn.classList.remove('loading'));
}

function updateClassPercent() {
    if (!currentSubject) return;

    const today = todayKey();
    let present = 0;

    STUDENT_ROLLS.forEach(roll => {
        const status = localStorage.getItem(
            `attendance_${currentSubject.code}_${roll}_${today}`
        );

        if (status === 'Present') present++;
    });

    const percent = STUDENT_ROLLS.length
        ? Math.round((present / STUDENT_ROLLS.length) * 100)
        : 0;

    const percentElement = document.getElementById('classPercent');
    const oldPercent = parseInt(percentElement.textContent) || 0;

    // Animate the percentage change
    animateNumber(percentElement, oldPercent, percent, 1000);

    // Update progress bar if it exists
    const progressBar = document.querySelector('.progress-bar .progress-fill');
    if (progressBar) {
        progressBar.style.width = percent + '%';
    }
}

// Number animation function
function animateNumber(element, from, to, duration) {
    const start = Date.now();
    const step = () => {
        const progress = Math.min((Date.now() - start) / duration, 1);
        const current = Math.round(from + (to - from) * progress);
        element.textContent = current + '%';

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);
}

function savePerformance() {
    if (!currentSubject) return;

    const roll = Number(document.getElementById('roll').value);
    const marks = Number(document.getElementById('marks').value);
    const msg = document.getElementById('message');
    const button = document.querySelector('#performanceSection .btn');

    // Add loading state
    button.classList.add('loading');
    button.textContent = 'Saving...';

    if (!STUDENT_ROLLS.includes(roll)) {
        msg.style.color = 'red';
        msg.innerText = 'Invalid Roll Number';
        msg.className = 'error-msg';
        showToast('Invalid roll number', 'error');
        button.classList.remove('loading');
        button.textContent = 'Save';
        return;
    }

    if (isNaN(marks) || marks < 0 || marks > 20) {
        msg.style.color = 'red';
        msg.innerText = 'Marks must be between 0 and 20';
        msg.className = 'error-msg';
        showToast('Marks must be between 0 and 20', 'error');
        button.classList.remove('loading');
        button.textContent = 'Save';
        return;
    }

    const weekStart = getWeekStartKey();

    setTimeout(() => {
        localStorage.setItem(
            `marks_${currentSubject.code}_${roll}_${weekStart}`,
            marks
        );

        document.getElementById(`perf-${roll}`).innerText = marks;

        // Add success animation to the marks cell
        const marksCell = document.getElementById(`perf-${roll}`);
        marksCell.style.animation = 'bounce 0.5s ease-out';
        marksCell.style.color = '#28a745';
        marksCell.style.fontWeight = 'bold';

        msg.style.color = 'green';
        msg.innerText = 'Marks Saved Successfully';
        msg.className = 'success-msg';

        showToast('Marks saved successfully!', 'success');

        // Clear form with animation
        const rollInput = document.getElementById('roll');
        const marksInput = document.getElementById('marks');

        rollInput.style.animation = 'fadeOut 0.3s ease-out';
        marksInput.style.animation = 'fadeOut 0.3s ease-out';

        setTimeout(() => {
            rollInput.value = '';
            marksInput.value = '';
            rollInput.style.animation = '';
            marksInput.style.animation = '';
            msg.innerText = '';
        }, 2000);

        button.classList.remove('loading');
        button.textContent = 'Save';

        // Reset marks cell animation
        setTimeout(() => {
            marksCell.style.animation = '';
            marksCell.style.color = '';
            marksCell.style.fontWeight = '';
        }, 500);
    }, 500);
}

function showAttendance() {
    switchSection('attendanceSection');
}

function showPerformance() {
    switchSection('performanceSection');
}

function showSchedule() {
    switchSection('scheduleSection');
    loadScheduleInteractions();
}

function showEvents() {
    switchSection('eventsSection');
    loadEvents();
}

function showClassReport() {
    switchSection('classReportSection');
}

function showChangePassword() {
    switchSection('changePasswordSection');
}

function showAddStudent() {
    switchSection('addStudentSection');
    loadStudentsTable();
}

function switchSection(targetSectionId) {
    const sections = ['attendanceSection', 'performanceSection', 'scheduleSection', 'eventsSection', 'classReportSection', 'changePasswordSection', 'addStudentSection'];

    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (sectionId === targetSectionId) {
            section.style.display = 'block';
            section.style.animation = 'slideIn 0.4s ease-out';
        } else {
            section.style.animation = 'fadeOut 0.2s ease-out';
            setTimeout(() => {
                section.style.display = 'none';
            }, 200);
        }
    });
}

function loadScheduleInteractions() {
    // Add click handlers to schedule periods
    const periods = document.querySelectorAll('.schedule-period');
    periods.forEach(period => {
        period.onclick = function() {
            const subject = this.textContent;
            const day = this.parentElement.cells[0].textContent;
            const periodNum = Array.from(this.parentElement.cells).indexOf(this);

            showToast(`${subject} class on ${day}, Period ${periodNum}`, 'info', 2000);
        };
    });

    // Add progress bar to attendance section if not exists
    const attendanceCard = document.getElementById('attendanceSection');
    if (!attendanceCard.querySelector('.progress-bar')) {
        const percentElement = document.getElementById('classPercent');
        const progressContainer = document.createElement('div');
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${parseInt(percentElement.textContent)}%"></div>
            </div>
        `;
        percentElement.parentElement.appendChild(progressContainer);
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const msg = document.getElementById('passwordMsg');
    const button = document.querySelector('#changePasswordSection .btn');

    // Add loading state
    button.classList.add('loading');
    button.textContent = 'Changing...';

    const user = getCurrentUser();

    if (!user) {
        msg.innerText = 'User not found';
        msg.className = 'error-msg';
        showToast('User not found', 'error');
        button.classList.remove('loading');
        button.textContent = 'Change Password';
        return;
    }

    if (currentPassword !== user.password) {
        msg.innerText = 'Current password is incorrect';
        msg.className = 'error-msg';
        showToast('Current password is incorrect', 'error');
        button.classList.remove('loading');
        button.textContent = 'Change Password';
        return;
    }

    if (newPassword.length < 6) {
        msg.innerText = 'New password must be at least 6 characters';
        msg.className = 'error-msg';
        showToast('Password must be at least 6 characters', 'error');
        button.classList.remove('loading');
        button.textContent = 'Change Password';
        return;
    }

    if (newPassword !== confirmPassword) {
        msg.innerText = 'New passwords do not match';
        msg.className = 'error-msg';
        showToast('Passwords do not match', 'error');
        button.classList.remove('loading');
        button.textContent = 'Change Password';
        return;
    }

    const result = await apiPost('/change-password', {
        username: user.username,
        currentPassword,
        newPassword
    });

    if (!result || !result.success) {
        msg.innerText = 'Could not change password';
        msg.className = 'error-msg';
        showToast('Could not change password', 'error');
        button.classList.remove('loading');
        button.textContent = 'Change Password';
        return;
    }

    localStorage.setItem('user', JSON.stringify(result.user));

    msg.innerText = 'Password changed successfully';
    msg.className = 'success-msg';
    showToast('Password changed successfully!', 'success');

    const inputs = ['currentPassword', 'newPassword', 'confirmPassword'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        input.style.animation = 'fadeOut 0.3s ease-out';
    });

    setTimeout(() => {
        inputs.forEach(id => {
            document.getElementById(id).value = '';
            document.getElementById(id).style.animation = '';
        });
        msg.innerText = '';
    }, 2000);

    button.classList.remove('loading');
    button.textContent = 'Change Password';
}

async function addStudent() {
    const roll = Number(document.getElementById('newRoll').value);
    const name = document.getElementById('newName').value.trim();
    const msg = document.getElementById('studentMsg');
    const button = document.querySelector('#addStudentSection .btn');

    button.classList.add('loading');
    button.textContent = 'Adding...';

    if (!roll || roll <= 0) {
        msg.innerText = 'Please enter a valid roll number';
        msg.className = 'error-msg';
        showToast('Please enter a valid roll number', 'error');
        button.classList.remove('loading');
        button.textContent = 'Add Student';
        return;
    }

    if (!name) {
        msg.innerText = 'Please enter student name';
        msg.className = 'error-msg';
        showToast('Please enter student name', 'error');
        button.classList.remove('loading');
        button.textContent = 'Add Student';
        return;
    }

    if (STUDENT_ROLLS.includes(roll)) {
        msg.innerText = 'Roll number already exists';
        msg.className = 'error-msg';
        showToast('Roll number already exists', 'error');
        button.classList.remove('loading');
        button.textContent = 'Add Student';
        return;
    }

    const backend = await apiPost('/students', { roll, name });

    if (!backend) {
        // fallback local add if backend not available
        STUDENT_ROLLS.push(roll);
        STUDENT_NAMES[roll] = name;
        STUDENT_IDS[roll] = null;
        localStorage.setItem('student_rolls', JSON.stringify(STUDENT_ROLLS));
        localStorage.setItem('student_names', JSON.stringify(STUDENT_NAMES));
        msg.innerText = 'Added locally (offline)';
        msg.className = 'success-msg';
        showToast('Student added locally', 'info');
    } else {
        STUDENT_ROLLS.push(roll);
        STUDENT_NAMES[roll] = name;
        STUDENT_IDS[roll] = backend._id;
        msg.innerText = 'Student added successfully';
        msg.className = 'success-msg';
        showToast(`Student ${name} added successfully!`, 'success');
    }

    const rollInput = document.getElementById('newRoll');
    const nameInput = document.getElementById('newName');
    rollInput.style.animation = 'fadeOut 0.3s ease-out';
    nameInput.style.animation = 'fadeOut 0.3s ease-out';

    setTimeout(() => {
        rollInput.value = '';
        nameInput.value = '';
        rollInput.style.animation = '';
        nameInput.style.animation = '';
        msg.innerText = '';
    }, 2000);

    loadStudentsTable();
    loadAttendanceTable();
    loadPerformanceTable();
    loadReportTable();

    button.classList.remove('loading');
    button.textContent = 'Add Student';
}

function loadStudentsTable() {
    const table = document.getElementById('studentsTable');

    // Clear existing rows except header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Add current students
    STUDENT_ROLLS.forEach(roll => {
        const row = table.insertRow();
        row.insertCell(0).innerText = roll;
        row.insertCell(1).innerText = STUDENT_NAMES[roll];
        row.insertCell(2).innerHTML = `<button onclick="removeStudent(${roll})" class="btn small-btn">Remove</button>`;
    });
}

async function removeStudent(roll) {
    if (!confirm(`Are you sure you want to remove student ${STUDENT_NAMES[roll]}?`)) {
        return;
    }

    const studentId = STUDENT_IDS[roll];
    if (studentId) {
        const deleted = await apiDelete(`/students/${studentId}`);
        if (deleted && deleted.success) {
            showToast('Student deleted from backend', 'success');
        } else {
            showToast('Could not delete student from backend, removed locally', 'warning');
        }
    }

    // Remove from arrays
    const index = STUDENT_ROLLS.indexOf(roll);
    if (index > -1) {
        STUDENT_ROLLS.splice(index, 1);
        delete STUDENT_NAMES[roll];
        delete STUDENT_IDS[roll];
    }

    // Update localStorage
    localStorage.setItem('student_rolls', JSON.stringify(STUDENT_ROLLS));
    localStorage.setItem('student_names', JSON.stringify(STUDENT_NAMES));

    // Reload table
    loadStudentsTable();
}

function addEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const description = document.getElementById('eventDescription').value.trim();
    const msg = document.getElementById('eventMsg');
    const button = document.querySelector('#eventsSection .btn');

    // Add loading state
    button.classList.add('loading');
    button.textContent = 'Adding...';

    if (!title || !date) {
        msg.innerText = 'Please enter event title and date';
        msg.className = 'error-msg';
        showToast('Please enter event title and date', 'error');
        button.classList.remove('loading');
        button.textContent = 'Add Event';
        return;
    }

    setTimeout(() => {
        const events = JSON.parse(localStorage.getItem('school_events') || '[]');
        const newEvent = {
            id: Date.now(),
            title,
            date,
            description: description || '',
            created: new Date().toISOString()
        };

        events.push(newEvent);
        localStorage.setItem('school_events', JSON.stringify(events));

        msg.innerText = 'Event added successfully';
        msg.className = 'success-msg';
        showToast(`Event "${title}" added successfully!`, 'success');

        // Clear form with animation
        const inputs = ['eventTitle', 'eventDate', 'eventDescription'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            input.style.animation = 'fadeOut 0.3s ease-out';
        });

        setTimeout(() => {
            inputs.forEach(id => {
                document.getElementById(id).value = '';
                document.getElementById(id).style.animation = '';
            });
            msg.innerText = '';
        }, 2000);

        // Reload events
        loadEvents();

        button.classList.remove('loading');
        button.textContent = 'Add Event';
    }, 600);
}

function loadEvents() {
    const eventsList = document.getElementById('eventsList');
    const events = JSON.parse(localStorage.getItem('school_events') || '[]');

    // Sort events by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    eventsList.innerHTML = '';

    if (events.length === 0) {
        eventsList.innerHTML = '<p style="text-align: center; color: #666;">No upcoming events</p>';
        return;
    }

    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'upcoming-event';
        eventDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #333;">${event.title}</h4>
                    <p style="margin: 0; color: #666;"><strong>Date:</strong> ${formatDate(event.date)}</p>
                    ${event.description ? `<p style="margin: 5px 0 0 0; color: #555;">${event.description}</p>` : ''}
                </div>
                <button onclick="deleteEvent(${event.id})" class="btn small-btn" style="background: #dc3545;">Delete</button>
            </div>
        `;
        eventsList.appendChild(eventDiv);
    });

    // Also update the schedule section events
    updateScheduleEvents(events);
}

function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }

    const events = JSON.parse(localStorage.getItem('school_events') || '[]');
    const filteredEvents = events.filter(event => event.id !== eventId);
    localStorage.setItem('school_events', JSON.stringify(filteredEvents));

    showToast('Event deleted successfully', 'success');
    loadEvents();
}

function updateScheduleEvents(events) {
    const upcomingEventsDiv = document.getElementById('upcomingEvents');
    if (!upcomingEventsDiv) return;

    const today = new Date();
    const upcomingEvents = events.filter(event => new Date(event.date) >= today).slice(0, 3);

    let html = '';
    if (upcomingEvents.length === 0) {
        html = '<p>No upcoming events scheduled</p>';
    } else {
        upcomingEvents.forEach(event => {
            html += `<div class="upcoming-event">
                <p><strong>${formatDate(event.date)}:</strong> ${event.title}</p>
                ${event.description ? `<p style="font-size: 14px; color: #666;">${event.description}</p>` : ''}
            </div>`;
        });
    }

    upcomingEventsDiv.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (localStorage.getItem('teacherLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    // Load saved students from localStorage
    const savedRolls = localStorage.getItem('student_rolls');
    const savedNames = localStorage.getItem('student_names');

    if (savedRolls) {
        STUDENT_ROLLS.length = 0;
        JSON.parse(savedRolls).forEach(roll => STUDENT_ROLLS.push(roll));
    }

    if (savedNames) {
        Object.assign(STUDENT_NAMES, JSON.parse(savedNames));
    }

    // Load dashboard
    loadDashboard();

    // Load events for schedule section
    const events = JSON.parse(localStorage.getItem('school_events') || '[]');
    if (events.length === 0) {
        // Add some default events
        const defaultEvents = [
            {
                id: 1,
                title: 'Unit Test - Science',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
                description: 'Chapter 5-8 Science test',
                created: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Mid-term Examinations',
                date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next month
                description: '15th - 25th of next month',
                created: new Date().toISOString()
            },
            {
                id: 3,
                title: 'Annual Sports Day',
                date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
                description: 'Inter-house sports competitions',
                created: new Date().toISOString()
            }
        ];
        localStorage.setItem('school_events', JSON.stringify(defaultEvents));
        updateScheduleEvents(defaultEvents);
    } else {
        updateScheduleEvents(events);
    }
});

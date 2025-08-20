// ================= Admin Login System =================
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('login-error');
    const loginSection = document.getElementById('admin-login');
    const dashboardSection = document.getElementById('admin-dashboard');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === "admin" && password === "12345") {
                loginSection.style.display = "none";
                dashboardSection.style.display = "block";
                initializeAdmin(); // load existing dashboard
            } else {
                loginError.textContent = "Invalid username or password!";
            }
        });
    }
});

// ================= Admin Dashboard JavaScript =================

// Global variables
let currentTab = 'bookings';
let bookingsData = [];
let guestsData = [];

// Initialize admin dashboard
function initializeAdmin() {
    loadSampleData();
    initializeCharts();
    setupTabNavigation();
    setupEventListeners();
    loadDashboardData();
}

// Load sample data
function loadSampleData() {
    bookingsData = [
        { id: 1, guestName: 'Rajesh Kumar', roomType: 'Deluxe Room', checkin: '2024-01-15', checkout: '2024-01-17', amount: 20000, status: 'confirmed' },
        { id: 2, guestName: 'Priya Sharma', roomType: 'Executive Suite', checkin: '2024-01-16', checkout: '2024-01-19', amount: 54000, status: 'checked-in' },
        { id: 3, guestName: 'Amit Patel', roomType: 'Presidential Suite', checkin: '2024-01-14', checkout: '2024-01-16', amount: 70000, status: 'checked-out' },
        { id: 4, guestName: 'Neha Singh', roomType: 'Deluxe Room', checkin: '2024-01-18', checkout: '2024-01-20', amount: 20000, status: 'cancelled' }
    ];

    guestsData = [
        { id: 1, name: 'Rajesh Kumar', email: 'rajesh.kumar@email.com', phone: '9876543210', nationality: 'Indian', totalVisits: 3 },
        { id: 2, name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '8765432109', nationality: 'Indian', totalVisits: 1 },
        { id: 3, name: 'Amit Patel', email: 'amit.patel@email.com', phone: '7654321098', nationality: 'Indian', totalVisits: 5 },
        { id: 4, name: 'Neha Singh', email: 'neha.singh@email.com', phone: '6543210987', nationality: 'Indian', totalVisits: 2 }
    ];
}

// ... (keep your existing functions: setupTabNavigation, switchTab, updateDashboardStats, loadBookingsTable, loadGuestsTable, filterBookings, etc.)

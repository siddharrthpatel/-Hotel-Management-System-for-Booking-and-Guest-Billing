// Booking System JavaScript

// Global variables
let currentStep = 1;
let selectedRoom = null;
let bookingData = {};

// Initialize booking system
document.addEventListener('DOMContentLoaded', function() {
    initializeBooking();
    setMinDates();
});

// Initialize booking system
function initializeBooking() {
    // Room selection
    const roomOptions = document.querySelectorAll('.room-option');
    roomOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove previous selection
            roomOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selection to clicked option
            this.classList.add('selected');
            selectedRoom = this.dataset.room;
            
            // Enable next button
            document.querySelector('#step1 .btn-primary').disabled = false;
        });
    });

    // Date inputs validation
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    checkinInput.addEventListener('change', function() {
        const checkinDate = new Date(this.value);
        const minCheckout = new Date(checkinDate);
        minCheckout.setDate(minCheckout.getDate() + 1);
        
        checkoutInput.min = minCheckout.toISOString().split('T')[0];
        
        if (checkoutInput.value && new Date(checkoutInput.value) <= checkinDate) {
            checkoutInput.value = minCheckout.toISOString().split('T')[0];
        }
    });

    checkoutInput.addEventListener('change', function() {
        if (checkinInput.value && this.value) {
            document.getElementById('next-step2').disabled = false;
        }
    });

    // Payment method toggle
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    const cardDetails = document.getElementById('card-details');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'card') {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });
}

// Set minimum dates for date inputs
function setMinDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    checkinInput.min = today.toISOString().split('T')[0];
    checkoutInput.min = tomorrow.toISOString().split('T')[0];
}

// Navigation functions
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < 5) {
            document.getElementById(`step${currentStep}`).classList.remove('active');
            currentStep++;
            document.getElementById(`step${currentStep}`).classList.add('active');
            
            if (currentStep === 4) {
                updateBookingSummary();
            }
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
    }
}

// Validate current step
function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            if (!selectedRoom) {
                showNotification('Please select a room type.', 'error');
                return false;
            }
            break;
            
        case 2:
            const checkin = document.getElementById('checkin').value;
            const checkout = document.getElementById('checkout').value;
            
            if (!checkin || !checkout) {
                showNotification('Please select check-in and check-out dates.', 'error');
                return false;
            }
            
            if (new Date(checkout) <= new Date(checkin)) {
                showNotification('Check-out date must be after check-in date.', 'error');
                return false;
            }
            break;
            
        case 3:
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            
            if (!firstName || !lastName || !email || !phone) {
                showNotification('Please fill in all required fields.', 'error');
                return false;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return false;
            }
            
            if (!Utils.validatePhone(phone)) {
                showNotification('Please enter a valid phone number.', 'error');
                return false;
            }
            break;
    }
    
    return true;
}

// Check room availability
async function checkAvailability() {
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    
    if (!checkin || !checkout) {
        showNotification('Please select check-in and check-out dates first.', 'error');
        return;
    }
    
    if (!selectedRoom) {
        showNotification('Please select a room type first.', 'error');
        return;
    }
    
    const resultDiv = document.getElementById('availability-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking availability...';
    resultDiv.className = '';
    
    try {
        const result = await checkRoomAvailability(selectedRoom, checkin, checkout);
        
        if (result.available) {
            resultDiv.innerHTML = '<i class="fas fa-check"></i> ' + result.message;
            resultDiv.className = 'available';
            document.getElementById('next-step2').disabled = false;
        } else {
            resultDiv.innerHTML = '<i class="fas fa-times"></i> ' + result.message;
            resultDiv.className = 'unavailable';
            document.getElementById('next-step2').disabled = true;
        }
    } catch (error) {
        resultDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error checking availability. Please try again.';
        resultDiv.className = 'unavailable';
    }
}

// Update booking summary
function updateBookingSummary() {
    const summaryContent = document.getElementById('booking-summary-content');
    
    // Collect booking data
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    // Calculate dates and price
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
    const totalPrice = calculatePrice(selectedRoom, nights, parseInt(guests));
    
    // Room type display name
    const roomNames = {
        'deluxe': 'Deluxe Room',
        'executive': 'Executive Suite',
        'presidential': 'Presidential Suite'
    };
    
    // Create summary HTML
    const summaryHTML = `
        <div class="summary-item">
            <span>Room Type:</span>
            <span>${roomNames[selectedRoom]}</span>
        </div>
        <div class="summary-item">
            <span>Check-in:</span>
            <span>${Utils.formatDate(checkin)}</span>
        </div>
        <div class="summary-item">
            <span>Check-out:</span>
            <span>${Utils.formatDate(checkout)}</span>
        </div>
        <div class="summary-item">
            <span>Nights:</span>
            <span>${nights}</span>
        </div>
        <div class="summary-item">
            <span>Guests:</span>
            <span>${guests}</span>
        </div>
        <div class="summary-item">
            <span>Guest Name:</span>
            <span>${firstName} ${lastName}</span>
        </div>
        <div class="summary-item">
            <span>Email:</span>
            <span>${email}</span>
        </div>
        <div class="summary-item">
            <span>Phone:</span>
            <span>${phone}</span>
        </div>
        <div class="summary-item">
            <span>Total Amount:</span>
            <span>${Utils.formatCurrency(totalPrice)}</span>
        </div>
    `;
    
    summaryContent.innerHTML = summaryHTML;
    
    // Store booking data
    bookingData = {
        roomType: selectedRoom,
        roomName: roomNames[selectedRoom],
        checkin: checkin,
        checkout: checkout,
        nights: nights,
        guests: parseInt(guests),
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        totalPrice: totalPrice,
        bookingDate: new Date().toISOString()
    };
}

// Confirm booking
function confirmBooking() {
    // Validate payment details if card payment is selected
    const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
    
    if (selectedPayment === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiry = document.getElementById('expiry').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value;
        
        if (!cardNumber || !expiry || !cvv || !cardName) {
            showNotification('Please fill in all card details.', 'error');
            return;
        }
        
        if (!validateCardNumber(cardNumber)) {
            showNotification('Please enter a valid card number.', 'error');
            return;
        }
    }
    
    // Simulate payment processing
    showNotification('Processing payment...', 'info');
    
    setTimeout(() => {
        // Save booking to storage
        const savedBooking = HotelStorage.saveBooking(bookingData);
        
        // Show confirmation
        showFinalBookingDetails(savedBooking);
        nextStep();
        
        showNotification('Booking confirmed successfully!', 'success');
    }, 2000);
}

// Show final booking details
function showFinalBookingDetails(booking) {
    const detailsDiv = document.getElementById('final-booking-details');
    
    const detailsHTML = `
        <div class="summary-item">
            <span>Booking ID:</span>
            <span>#${booking.id}</span>
        </div>
        <div class="summary-item">
            <span>Room:</span>
            <span>${booking.roomName}</span>
        </div>
        <div class="summary-item">
            <span>Check-in:</span>
            <span>${Utils.formatDate(booking.checkin)}</span>
        </div>
        <div class="summary-item">
            <span>Check-out:</span>
            <span>${Utils.formatDate(booking.checkout)}</span>
        </div>
        <div class="summary-item">
            <span>Guests:</span>
            <span>${booking.guests}</span>
        </div>
        <div class="summary-item">
            <span>Total Amount:</span>
            <span>${Utils.formatCurrency(booking.totalPrice)}</span>
        </div>
        <div class="summary-item">
            <span>Status:</span>
            <span style="color: #4CAF50;">Confirmed</span>
        </div>
    `;
    
    detailsDiv.innerHTML = detailsHTML;
}

// Download invoice
function downloadInvoice() {
    const booking = HotelStorage.getBookings().find(b => b.id === bookingData.id);
    if (!booking) return;
    
    const invoiceNumber = Utils.generateInvoiceNumber();
    const invoiceDate = new Date().toLocaleDateString('en-IN');
    
    const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - Royal Palace Hotel</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .invoice-details { margin-bottom: 30px; }
                .guest-details { margin-bottom: 30px; }
                .booking-details { margin-bottom: 30px; }
                .total { font-weight: bold; font-size: 1.2em; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f8f9fa; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Royal Palace Hotel</h1>
                <p>123 Palace Road, Mumbai, Maharashtra 400001</p>
                <p>Phone: +91 22 1234 5678 | Email: info@royalpalacehotel.com</p>
            </div>
            
            <div class="invoice-details">
                <h2>INVOICE</h2>
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
                <p><strong>Booking ID:</strong> #${booking.id}</p>
            </div>
            
            <div class="guest-details">
                <h3>Guest Information</h3>
                <p><strong>Name:</strong> ${booking.firstName} ${booking.lastName}</p>
                <p><strong>Email:</strong> ${booking.email}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
            </div>
            
            <div class="booking-details">
                <h3>Booking Details</h3>
                <table>
                    <tr>
                        <th>Description</th>
                        <th>Details</th>
                    </tr>
                    <tr>
                        <td>Room Type</td>
                        <td>${booking.roomName}</td>
                    </tr>
                    <tr>
                        <td>Check-in Date</td>
                        <td>${Utils.formatDate(booking.checkin)}</td>
                    </tr>
                    <tr>
                        <td>Check-out Date</td>
                        <td>${Utils.formatDate(booking.checkout)}</td>
                    </tr>
                    <tr>
                        <td>Number of Nights</td>
                        <td>${booking.nights}</td>
                    </tr>
                    <tr>
                        <td>Number of Guests</td>
                        <td>${booking.guests}</td>
                    </tr>
                    <tr class="total">
                        <td>Total Amount</td>
                        <td>${Utils.formatCurrency(booking.totalPrice)}</td>
                    </tr>
                </table>
            </div>
            
            <div style="margin-top: 40px; text-align: center;">
                <p>Thank you for choosing Royal Palace Hotel!</p>
                <p>For any queries, please contact us at +91 22 1234 5678</p>
            </div>
        </body>
        </html>
    `;
    
    // Create and download PDF (simulated)
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Invoice downloaded successfully!', 'success');
}

// Utility functions
function validateCardNumber(cardNumber) {
    // Simple Luhn algorithm validation
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

// Email validation (reuse from main script)
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification function (reuse from main script)
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

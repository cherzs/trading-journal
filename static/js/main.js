/**
 * Main JavaScript file for Trading Journal
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize any components that need JavaScript
    initFormValidation();
    initTradeCalculations();
    setupAlerts();
    initMobileMenu();
});

/**
 * Initialize form validation
 */
function initFormValidation() {
    // Find forms that need validation
    const forms = document.querySelectorAll('form[data-validate="true"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            // Password matching validation for registration form
            if (form.id === 'register-form') {
                const password = document.getElementById('password');
                const confirmPassword = document.getElementById('confirm_password');
                
                if (password && confirmPassword && password.value !== confirmPassword.value) {
                    event.preventDefault();
                    showAlert('Passwords do not match', 'danger');
                    return false;
                }
            }
            
            // Additional validations can be added here
        });
    });
}

/**
 * Initialize trade calculations for the add/edit trade form
 */
function initTradeCalculations() {
    // Elements for trade calculations
    const entryPrice = document.getElementById('entry_price');
    const exitPrice = document.getElementById('exit_price');
    const size = document.getElementById('size');
    const tradeType = document.getElementById('trade_type');
    const stopLoss = document.getElementById('stop_loss');
    const takeProfit = document.getElementById('take_profit');
    const pnlDisplay = document.getElementById('pnl_display');
    const rrRatio = document.getElementById('rr_ratio');
    
    // If the elements don't exist, return
    if (!entryPrice || !exitPrice || !size || !tradeType) return;
    
    // Function to calculate P&L
    const calculatePnL = () => {
        if (!entryPrice.value || !exitPrice.value || !size.value) return;
        
        const entry = parseFloat(entryPrice.value);
        const exit = parseFloat(exitPrice.value);
        const position = parseFloat(size.value);
        const isLong = tradeType.value === 'long';
        
        let pnl = 0;
        if (isLong) {
            pnl = (exit - entry) * position;
        } else {
            pnl = (entry - exit) * position;
        }
        
        if (pnlDisplay) {
            pnlDisplay.textContent = pnl.toFixed(2);
            pnlDisplay.classList.remove('text-green-500', 'text-red-500');
            pnlDisplay.classList.add(pnl >= 0 ? 'text-green-500' : 'text-red-500');
        }
        
        // Calculate R:R ratio if stop loss and take profit are set
        if (rrRatio && stopLoss.value && takeProfit.value) {
            const sl = parseFloat(stopLoss.value);
            const tp = parseFloat(takeProfit.value);
            
            if (isLong) {
                const risk = entry - sl;
                const reward = tp - entry;
                if (risk > 0 && reward > 0) {
                    const ratio = (reward / risk).toFixed(2);
                    rrRatio.textContent = `${ratio}:1`;
                }
            } else {
                const risk = sl - entry;
                const reward = entry - tp;
                if (risk > 0 && reward > 0) {
                    const ratio = (reward / risk).toFixed(2);
                    rrRatio.textContent = `${ratio}:1`;
                }
            }
        }
    };
    
    // Add event listeners to calculate P&L
    [entryPrice, exitPrice, size, tradeType, stopLoss, takeProfit].forEach(element => {
        if (element) {
            element.addEventListener('input', calculatePnL);
            element.addEventListener('change', calculatePnL);
        }
    });
}

/**
 * Show an alert message
 * @param {string} message - The message to display
 * @param {string} type - The type of alert ('success', 'danger', 'warning', 'info')
 * @param {number} duration - How long to show the alert in milliseconds (default: 5000)
 */
function showAlert(message, type = 'info', duration = 5000) {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    
    const alertElement = document.createElement('div');
    alertElement.className = `alert-message px-4 py-3 rounded-md shadow-md mb-3 ${
        type === 'success' ? 'bg-green-500' :
        type === 'danger' ? 'bg-red-500' :
        type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    } text-white`;
    
    alertElement.innerHTML = `
        <div class="flex items-center">
            <div class="py-1 mr-2">
                <i class="fas fa-${
                    type === 'success' ? 'check-circle' :
                    type === 'danger' ? 'exclamation-circle' :
                    type === 'warning' ? 'exclamation-triangle' : 'info-circle'
                }"></i>
            </div>
            <div>
                <p class="font-bold">${
                    type === 'success' ? 'Success' :
                    type === 'danger' ? 'Error' :
                    type === 'warning' ? 'Warning' : 'Information'
                }</p>
                <p class="text-sm">${message}</p>
            </div>
        </div>
    `;
    
    alertContainer.appendChild(alertElement);
    
    // Add fade-in animation
    setTimeout(() => {
        alertElement.classList.add('fadeIn');
    }, 10);
    
    // Auto-remove the alert after the specified duration
    setTimeout(() => {
        alertElement.style.opacity = '0';
        alertElement.style.transform = 'translateY(-10px)';
        alertElement.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            alertContainer.removeChild(alertElement);
        }, 500);
    }, duration);
}

/**
 * Set up the alert system
 */
function setupAlerts() {
    // Check if there are any existing alerts (e.g., from Flask flash messages)
    const alerts = document.querySelectorAll('.alert-message');
    
    // Auto-dismiss existing alerts
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-10px)';
            alert.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 500);
        }, 5000);
    });
}

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
} 
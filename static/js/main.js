// Trading Journal & Strategy Backtester - Main JavaScript

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Check if we are on the login/register page
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tradeForm = document.getElementById('trade-form');
    const dashboardStats = document.getElementById('dashboard-stats');
    
    // Login Form Handler
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simple validation
            if (!email || !password) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            // Submit form - normally this would use fetch API to a backend
            loginForm.submit();
        });
    }
    
    // Register Form Handler
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            
            // Simple validation
            if (!username || !email || !password || !confirmPassword) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showAlert('Passwords do not match', 'error');
                return;
            }
            
            // Submit form
            registerForm.submit();
        });
    }
    
    // Trade Form Handler
    if (tradeForm) {
        tradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const date = document.getElementById('date').value;
            const symbol = document.getElementById('symbol').value;
            const tradeType = document.getElementById('trade_type').value;
            const entryPrice = document.getElementById('entry_price').value;
            const exitPrice = document.getElementById('exit_price').value;
            const size = document.getElementById('size').value;
            
            // Validate required fields
            if (!date || !symbol || !tradeType || !entryPrice || !exitPrice || !size) {
                showAlert('Please fill in all required fields', 'error');
                return;
            }
            
            // Calculate R:R ratio if stop loss and take profit are provided
            const stopLoss = document.getElementById('stop_loss').value;
            const takeProfit = document.getElementById('take_profit').value;
            
            if (stopLoss && takeProfit) {
                const rrRatio = calculateRRRatio(
                    parseFloat(entryPrice), 
                    parseFloat(stopLoss), 
                    parseFloat(takeProfit),
                    tradeType
                );
                
                // Display the R:R ratio
                const rrRatioElement = document.getElementById('rr_ratio');
                if (rrRatioElement) {
                    rrRatioElement.textContent = rrRatio.toFixed(2);
                }
            }
            
            // Submit form
            tradeForm.submit();
        });
        
        // Live calculation of profit/loss
        const entryPriceInput = document.getElementById('entry_price');
        const exitPriceInput = document.getElementById('exit_price');
        const sizeInput = document.getElementById('size');
        const tradeTypeSelect = document.getElementById('trade_type');
        
        const pnlDisplay = document.getElementById('pnl_display');
        
        // Update P&L on input change
        if (entryPriceInput && exitPriceInput && sizeInput && pnlDisplay) {
            const updatePnL = function() {
                const entry = parseFloat(entryPriceInput.value) || 0;
                const exit = parseFloat(exitPriceInput.value) || 0;
                const size = parseFloat(sizeInput.value) || 0;
                const isLong = tradeTypeSelect.value === 'long';
                
                const pnl = calculatePnL(entry, exit, size, isLong);
                
                // Update display
                pnlDisplay.textContent = pnl.toFixed(2);
                
                // Add color classes based on profit/loss
                if (pnl > 0) {
                    pnlDisplay.className = 'text-green-500 font-bold';
                } else if (pnl < 0) {
                    pnlDisplay.className = 'text-red-500 font-bold';
                } else {
                    pnlDisplay.className = 'text-gray-500';
                }
            };
            
            entryPriceInput.addEventListener('input', updatePnL);
            exitPriceInput.addEventListener('input', updatePnL);
            sizeInput.addEventListener('input', updatePnL);
            tradeTypeSelect.addEventListener('change', updatePnL);
        }
    }
    
    // Dashboard Statistics and Charts
    if (dashboardStats) {
        // Create charts if there is trade data available
        if (window.tradeData) {
            createPerformanceChart();
            createStrategyBreakdownChart();
            createWinRateByDayChart();
        }
    }
});

// Utility Functions
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    
    if (!alertContainer) {
        // Create alert container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'alert-container';
        container.className = 'fixed top-4 right-4 z-50';
        document.body.appendChild(container);
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = 'px-4 py-3 rounded-lg shadow-md mb-3 animate-fadeIn';
    
    // Set background color based on type
    if (type === 'error') {
        alert.className += ' bg-red-100 border-l-4 border-red-500 text-red-700';
    } else if (type === 'success') {
        alert.className += ' bg-green-100 border-l-4 border-green-500 text-green-700';
    } else {
        alert.className += ' bg-blue-100 border-l-4 border-blue-500 text-blue-700';
    }
    
    alert.innerHTML = `
        <div class="flex items-center">
            <div class="py-1">
                <p class="text-sm">${message}</p>
            </div>
        </div>
    `;
    
    // Add alert to container
    document.getElementById('alert-container').appendChild(alert);
    
    // Remove alert after 3 seconds
    setTimeout(() => {
        alert.classList.add('opacity-0');
        alert.style.transition = 'opacity 0.5s ease';
        
        // Remove from DOM after fade out
        setTimeout(() => {
            alert.remove();
        }, 500);
    }, 3000);
}

// Calculate Risk-Reward Ratio
function calculateRRRatio(entry, stopLoss, takeProfit, tradeType) {
    if (!entry || !stopLoss || !takeProfit) {
        return 0;
    }
    
    let risk, reward;
    
    if (tradeType === 'long') {
        risk = Math.abs(entry - stopLoss);
        reward = Math.abs(takeProfit - entry);
    } else { // short
        risk = Math.abs(entry - stopLoss);
        reward = Math.abs(entry - takeProfit);
    }
    
    if (risk === 0) {
        return 0;
    }
    
    return reward / risk;
}

// Calculate Profit & Loss
function calculatePnL(entry, exit, size, isLong) {
    if (!entry || !exit || !size) {
        return 0;
    }
    
    if (isLong) {
        return (exit - entry) * size;
    } else { // short
        return (entry - exit) * size;
    }
}

// Create Charts (using Chart.js which would need to be included in HTML)
function createPerformanceChart() {
    if (!window.tradeData || !Chart) {
        return;
    }
    
    const ctx = document.getElementById('performance-chart');
    if (!ctx) return;
    
    // Extract dates and cumulative P&L
    const dates = [];
    const cumulativePnL = [];
    let runningTotal = 0;
    
    window.tradeData.forEach(trade => {
        dates.push(trade.date);
        runningTotal += trade.pnl;
        cumulativePnL.push(runningTotal);
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Cumulative P&L',
                data: cumulativePnL,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Trading Performance'
                }
            }
        }
    });
}

function createStrategyBreakdownChart() {
    if (!window.tradeData || !Chart) {
        return;
    }
    
    const ctx = document.getElementById('strategy-chart');
    if (!ctx) return;
    
    // Aggregate P&L by strategy
    const strategies = {};
    
    window.tradeData.forEach(trade => {
        if (!strategies[trade.strategy]) {
            strategies[trade.strategy] = 0;
        }
        strategies[trade.strategy] += trade.pnl;
    });
    
    const labels = Object.keys(strategies);
    const data = Object.values(strategies);
    
    // Define colors based on performance
    const colors = data.map(value => 
        value >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'
    );
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Profit/Loss by Strategy',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Strategy Performance'
                }
            }
        }
    });
}

function createWinRateByDayChart() {
    if (!window.tradeData || !Chart) {
        return;
    }
    
    const ctx = document.getElementById('winrate-by-day-chart');
    if (!ctx) return;
    
    // Aggregate wins/losses by day of week
    const dayStats = {
        'Monday': { wins: 0, total: 0 },
        'Tuesday': { wins: 0, total: 0 },
        'Wednesday': { wins: 0, total: 0 },
        'Thursday': { wins: 0, total: 0 },
        'Friday': { wins: 0, total: 0 }
    };
    
    window.tradeData.forEach(trade => {
        // Convert date string to Date object
        const date = new Date(trade.date);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        
        // Only process weekdays
        if (dayStats[dayOfWeek]) {
            dayStats[dayOfWeek].total++;
            if (trade.pnl > 0) {
                dayStats[dayOfWeek].wins++;
            }
        }
    });
    
    // Calculate win rates
    const labels = Object.keys(dayStats);
    const winRates = labels.map(day => {
        const stats = dayStats[day];
        return stats.total > 0 ? (stats.wins / stats.total * 100) : 0;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Win Rate by Day (%)',
                data: winRates,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Win Rate by Day of Week'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Initialize dashboard charts with purple theme
function initializeCharts() {
    // Check if we're on a page with charts
    if(document.getElementById('performance-chart')) {
        const chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#f1f1f6'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b8b5c0'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b8b5c0'
                    }
                }
            }
        };

        // Purple gradient for chart backgrounds
        const createGradient = (ctx) => {
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(138, 92, 247, 0.5)');
            gradient.addColorStop(1, 'rgba(138, 92, 247, 0.05)');
            return gradient;
        };

        // Sample performance chart with purple theme
        const performanceChart = new Chart(
            document.getElementById('performance-chart'),
            {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'P&L',
                        data: [0, 10, 5, 15, 10, 20],
                        borderColor: '#8a5cf7',
                        backgroundColor: function(context) {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            if (!chartArea) {
                                return 'rgba(138, 92, 247, 0.1)';
                            }
                            return createGradient(ctx);
                        },
                        tension: 0.3
                    }]
                },
                options: chartOptions
            }
        );

        // Sample strategy chart with purple theme
        const strategyChart = new Chart(
            document.getElementById('strategy-chart'),
            {
                type: 'bar',
                data: {
                    labels: ['Strategy A', 'Strategy B', 'Strategy C', 'Strategy D'],
                    datasets: [{
                        label: 'Win Rate %',
                        data: [65, 45, 75, 60],
                        backgroundColor: ['#8a5cf7', '#7341e0', '#a78bfa', '#5d34b0'],
                        borderRadius: 5
                    }]
                },
                options: chartOptions
            }
        );

        // Win rate by day chart with purple theme
        const winrateChart = new Chart(
            document.getElementById('winrate-by-day-chart'),
            {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    datasets: [{
                        label: 'Win Rate %',
                        data: [70, 55, 60, 80, 65],
                        backgroundColor: '#8a5cf7',
                        borderRadius: 5
                    }]
                },
                options: chartOptions
            }
        );
    }
}

// Setup trade form calculations
function setupTradeFormCalculations() {
    const entryPrice = document.getElementById('entry_price');
    const exitPrice = document.getElementById('exit_price');
    const size = document.getElementById('size');
    const tradeType = document.getElementById('trade_type');
    const stopLoss = document.getElementById('stop_loss');
    const takeProfit = document.getElementById('take_profit');
    const pnlDisplay = document.getElementById('pnl_display');
    const rrRatio = document.getElementById('rr_ratio');

    if(entryPrice && exitPrice && size && tradeType && pnlDisplay) {
        const calculatePnL = () => {
            const entry = parseFloat(entryPrice.value) || 0;
            const exit = parseFloat(exitPrice.value) || 0;
            const positionSize = parseFloat(size.value) || 0;
            const type = tradeType.value;
            
            let pnl = 0;
            if(type === 'long') {
                pnl = (exit - entry) * positionSize;
            } else {
                pnl = (entry - exit) * positionSize;
            }
            
            // Display PnL with color
            pnlDisplay.textContent = pnl.toFixed(2);
            if(pnl > 0) {
                pnlDisplay.classList.add('text-green-600');
                pnlDisplay.classList.remove('text-red-600');
            } else if(pnl < 0) {
                pnlDisplay.classList.add('text-red-600');
                pnlDisplay.classList.remove('text-green-600');
            } else {
                pnlDisplay.classList.remove('text-green-600', 'text-red-600');
            }
            
            // Calculate Risk/Reward ratio if stop loss and take profit are set
            if(stopLoss && takeProfit && rrRatio) {
                const sl = parseFloat(stopLoss.value) || 0;
                const tp = parseFloat(takeProfit.value) || 0;
                
                if(sl && tp && sl !== entry) {
                    let risk, reward;
                    if(type === 'long') {
                        risk = Math.abs(entry - sl);
                        reward = Math.abs(tp - entry);
                    } else {
                        risk = Math.abs(entry - sl);
                        reward = Math.abs(entry - tp);
                    }
                    
                    const ratio = (risk !== 0) ? (reward / risk).toFixed(2) : '-';
                    rrRatio.textContent = ratio;
                } else {
                    rrRatio.textContent = '-';
                }
            }
        };
        
        // Add event listeners
        entryPrice.addEventListener('input', calculatePnL);
        exitPrice.addEventListener('input', calculatePnL);
        size.addEventListener('input', calculatePnL);
        tradeType.addEventListener('change', calculatePnL);
        if(stopLoss) stopLoss.addEventListener('input', calculatePnL);
        if(takeProfit) takeProfit.addEventListener('input', calculatePnL);
    }
}

// Setup alert functionality
function setupAlerts() {
    const alertContainer = document.getElementById('alert-container');
    
    // Flash messages handling
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        // Auto-hide flash messages after 5 seconds
        setTimeout(() => {
            message.classList.add('opacity-0');
            setTimeout(() => {
                message.remove();
            }, 500);
        }, 5000);
        
        // Allow closing the message
        const closeBtn = message.querySelector('.close-btn');
        if(closeBtn) {
            closeBtn.addEventListener('click', () => {
                message.classList.add('opacity-0');
                setTimeout(() => {
                    message.remove();
                }, 500);
            });
        }
    });
    
    // Function to show alerts
    window.showAlert = function(message, type = 'success') {
        if(!alertContainer) return;
        
        const alert = document.createElement('div');
        alert.classList.add(
            'flash-message', 
            'p-4', 
            'rounded-md', 
            'shadow-md', 
            'flex', 
            'items-center', 
            'justify-between',
            'mb-4',
            'transition-opacity',
            'duration-500'
        );
        
        // Set color based on type
        if(type === 'success') {
            alert.classList.add('bg-green-800', 'text-green-100');
        } else if(type === 'error') {
            alert.classList.add('bg-red-800', 'text-red-100');
        } else if(type === 'warning') {
            alert.classList.add('bg-yellow-800', 'text-yellow-100');
        } else {
            alert.classList.add('bg-blue-800', 'text-blue-100');
        }
        
        alert.innerHTML = `
            <div class="flex items-center">
                <span>${message}</span>
            </div>
            <button class="close-btn ml-4 focus:outline-none">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
        
        alertContainer.appendChild(alert);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            alert.classList.add('opacity-0');
            setTimeout(() => {
                alert.remove();
            }, 500);
        }, 5000);
        
        // Close button
        const closeBtn = alert.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            alert.classList.add('opacity-0');
            setTimeout(() => {
                alert.remove();
            }, 500);
        });
    };
}

// Initialize functions when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupTradeFormCalculations();
    setupAlerts();
    initializeCharts();
}); 
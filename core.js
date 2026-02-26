const AgriGuard = (function() {
    'use strict';

    const STORAGE_KEYS = {
        CLAIMS: 'agriguard_claims',
        TRANSACTIONS: 'agriguard_transactions',
        USER: 'agriguard_user',
        SETTINGS: 'agriguard_settings'
    };

    const CROP_RATES = {
        wheat: 20000,
        rice: 25000,
        cotton: 30000,
        corn: 18000,
        soybean: 22000,
        sugarcane: 28000
    };

    const CROP_NAMES = {
        wheat: 'Wheat',
        rice: 'Rice',
        cotton: 'Cotton',
        corn: 'Corn',
        soybean: 'Soybean',
        sugarcane: 'Sugarcane'
    };

    const REGIONS = [
        'North District',
        'South District',
        'East District',
        'West District',
        'Central District',
        'Coastal Region',
        'Hill Region',
        'Plain Region'
    ];

    const CACHE = new Map();

    function $(selector) {
        if (!CACHE.has(selector)) {
            CACHE.set(selector, document.querySelector(selector));
        }
        return CACHE.get(selector);
    }

    function $$(selector) {
        if (!CACHE.has(selector)) {
            CACHE.set(selector, document.querySelectorAll(selector));
        }
        return CACHE.get(selector);
    }

    function clearCache() {
        CACHE.clear();
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    function createElement(tag, className, innerHTML) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (innerHTML) el.innerHTML = innerHTML;
        return el;
    }

    function showLoading(message = 'Loading...') {
        const existing = document.querySelector('.loading-overlay');
        if (existing) return existing;

        const overlay = createElement('div', 'loading-overlay');
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    function hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    function showNotification(message, type = 'info', duration = 4000) {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = createElement('div', `notification ${type}`);
        notification.innerHTML = `
            <div class="flex gap-md">
                <span class="notification-icon">${getNotificationIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, duration);

        return notification;
    }

    function getNotificationIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    function formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    function formatDateInput(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toISOString().split('T')[0];
    }

    function generateId(prefix = 'AG') {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    function generateTransactionId() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `TXN-${timestamp}-${random}`;
    }

    function getFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage read error:', e);
            return null;
        }
    }

    function saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage write error:', e);
            return false;
        }
    }

    function getClaims() {
        return getFromStorage(STORAGE_KEYS.CLAIMS) || [];
    }

    function saveClaim(claim) {
        const claims = getClaims();
        const existingIndex = claims.findIndex(c => c.id === claim.id);
        
        if (existingIndex >= 0) {
            claims[existingIndex] = claim;
        } else {
            claims.push(claim);
        }
        
        return saveToStorage(STORAGE_KEYS.CLAIMS, claims);
    }

    function getClaimById(id) {
        const claims = getClaims();
        return claims.find(c => c.id === id);
    }

    function getTransactions() {
        return getFromStorage(STORAGE_KEYS.TRANSACTIONS) || [];
    }

    function saveTransaction(transaction) {
        const transactions = getTransactions();
        transactions.push(transaction);
        return saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    }

    function getTransactionByClaimId(claimId) {
        const transactions = getTransactions();
        return transactions.find(t => t.claimId === claimId);
    }

    function isDuplicateClaim(farmerId, cropType, date) {
        const claims = getClaims();
        return claims.some(c => 
            c.farmerId === farmerId && 
            c.cropType === cropType && 
            c.date === date &&
            c.status !== 'rejected'
        );
    }

    function validateField(value, rules) {
        const errors = [];

        if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
            errors.push('This field is required');
        }

        if (rules.minLength && value && value.length < rules.minLength) {
            errors.push(`Minimum length is ${rules.minLength}`);
        }

        if (rules.maxLength && value && value.length > rules.maxLength) {
            errors.push(`Maximum length is ${rules.maxLength}`);
        }

        if (rules.min !== undefined && value !== '' && Number(value) < rules.min) {
            errors.push(`Minimum value is ${rules.min}`);
        }

        if (rules.max !== undefined && value !== '' && Number(value) > rules.max) {
            errors.push(`Maximum value is ${rules.max}`);
        }

        if (rules.pattern && value && !rules.pattern.test(value)) {
            errors.push(rules.patternMessage || 'Invalid format');
        }

        if (rules.custom && value) {
            const customResult = rules.custom(value);
            if (customResult !== true) {
                errors.push(customResult);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    function validateForm(formData, schema) {
        const errors = {};
        let isValid = true;

        for (const [field, rules] of Object.entries(schema)) {
            const value = formData[field];
            const result = validateField(value, rules);
            
            if (!result.valid) {
                errors[field] = result.errors[0];
                isValid = false;
            }
        }

        return { isValid, errors };
    }

    function showFieldError(fieldId, message) {
        const field = getElement(fieldId);
        if (!field) return;

        const formGroup = field.closest('.form-group') || field.parentElement;
        if (formGroup) {
            formGroup.classList.add('error');
            let errorEl = formGroup.querySelector('.form-error');
            if (!errorEl) {
                errorEl = createElement('div', 'form-error', message);
                formGroup.appendChild(errorEl);
            }
            errorEl.textContent = message;
        }
    }

    function clearFieldError(fieldId) {
        const field = getElement(fieldId);
        if (!field) return;

        const formGroup = field.closest('.form-group') || field.parentElement;
        if (formGroup) {
            formGroup.classList.remove('error');
            const errorEl = formGroup.querySelector('.form-error');
            if (errorEl) errorEl.remove();
        }
    }

    function clearAllErrors(form) {
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error');
            const errorEl = group.querySelector('.form-error');
            if (errorEl) errorEl.remove();
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    async function getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    function getAddressFromCoords(lat, lng) {
        return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    function getDistrictFromCoords(lat, lng) {
        const districts = [
            { name: 'North District', lat: 28.6, lng: 77.2 },
            { name: 'South District', lat: 28.4, lng: 77.2 },
            { name: 'East District', lat: 28.5, lng: 77.4 },
            { name: 'West District', lat: 28.5, lng: 77.0 },
            { name: 'Central District', lat: 28.5, lng: 77.2 },
            { name: 'Coastal Region', lat: 13.0, lng: 80.3 },
            { name: 'Hill Region', lat: 30.7, lng: 79.1 },
            { name: 'Plain Region', lat: 26.8, lng: 80.9 }
        ];

        let nearest = districts[0];
        let minDist = Infinity;

        for (const district of districts) {
            const dist = Math.sqrt(
                Math.pow(lat - district.lat, 2) + Math.pow(lng - district.lng, 2)
            );
            if (dist < minDist) {
                minDist = dist;
                nearest = district;
            }
        }

        return nearest.name;
    }

    function isHighRiskZone(region) {
        const highRiskZones = ['Coastal Region', 'Hill Region'];
        return highRiskZones.includes(region);
    }

    function getCropRate(cropType) {
        return CROP_RATES[cropType.toLowerCase()] || 0;
    }

    function getCropName(cropType) {
        return CROP_NAMES[cropType.toLowerCase()] || cropType;
    }

    function getStatusBadgeClass(status) {
        const classes = {
            'approved': 'badge-success',
            'review': 'badge-warning',
            'rejected': 'badge-danger',
            'pending': 'badge-info',
            'processing': 'badge-info',
            'completed': 'badge-success',
            'failed': 'badge-danger'
        };
        return classes[status.toLowerCase()] || 'badge-info';
    }

    function downloadCSV(data, filename) {
        if (!data || !data.length) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => {
                let val = row[h];
                if (typeof val === 'string' && val.includes(',')) {
                    val = `"${val}"`;
                }
                return val;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    function printReceipt(receiptData) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showNotification('Please allow popups for printing', 'warning');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>AgriGuard Receipt - ${receiptData.transactionId}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #1a5f2a; }
                    .logo { font-size: 24px; font-weight: bold; color: #1a5f2a; }
                    .title { font-size: 18px; color: #666; margin-top: 10px; }
                    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .label { color: #666; }
                    .value { font-weight: 600; }
                    .total { font-size: 20px; font-weight: bold; color: #1a5f2a; margin-top: 20px; padding-top: 20px; border-top: 2px solid #1a5f2a; }
                    .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">🌾 AgriGuard AI Smart</div>
                    <div class="title">Payment Receipt</div>
                </div>
                <div class="row"><span class="label">Transaction ID</span><span class="value">${receiptData.transactionId}</span></div>
                <div class="row"><span class="label">Claim ID</span><span class="value">${receiptData.claimId}</span></div>
                <div class="row"><span class="label">Farmer Name</span><span class="value">${receiptData.farmerName}</span></div>
                <div class="row"><span class="label">Crop Type</span><span class="value">${receiptData.cropType}</span></div>
                <div class="row"><span class="label">Land Size</span><span class="value">${receiptData.landSize} acres</span></div>
                <div class="row"><span class="label">Bank Account</span><span class="value">${receiptData.bankAccount}</span></div>
                <div class="row"><span class="label">Payment Date</span><span class="value">${formatDate(receiptData.date)}</span></div>
                <div class="row total"><span class="label">Amount Paid</span><span class="value">${formatCurrency(receiptData.amount)}</span></div>
                <div class="footer">
                    <p>This is a computer-generated receipt.</p>
                    <p>AgriGuard AI Smart - Agricultural Insurance Platform</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    function animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const diff = end - start;
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + diff * easeProgress);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    function addAnimationListener(element, animationClass, callback) {
        const observer = new MutationObserver(() => {
            if (element.classList.contains(animationClass)) {
                callback();
            }
        });
        observer.observe(element, { attributes: true, attributeFilter: ['class'] });
    }

    return {
        $,
        $$,
        getElement,
        createElement,
        showLoading,
        hideLoading,
        showNotification,
        formatCurrency,
        formatDate,
        formatDateInput,
        generateId,
        generateTransactionId,
        getFromStorage,
        saveToStorage,
        getClaims,
        saveClaim,
        getClaimById,
        getTransactions,
        saveTransaction,
        getTransactionByClaimId,
        isDuplicateClaim,
        validateField,
        validateForm,
        showFieldError,
        clearFieldError,
        clearAllErrors,
        debounce,
        throttle,
        getCurrentLocation,
        getAddressFromCoords,
        getDistrictFromCoords,
        isHighRiskZone,
        getCropRate,
        getCropName,
        getStatusBadgeClass,
        downloadCSV,
        printReceipt,
        animateValue,
        addAnimationListener,
        clearCache,
        STORAGE_KEYS,
        CROP_RATES,
        CROP_NAMES,
        REGIONS
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgriGuard;
}

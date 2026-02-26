const Analytics = (function() {
    'use strict';

    const COLORS = {
        primary: '#1a5f2a',
        primaryLight: '#2d7a44',
        accent: '#38b2ac',
        accentLight: '#4fd1c5',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        text: '#f8fafc',
        textMuted: 'rgba(255, 255, 255, 0.6)',
        grid: 'rgba(255, 255, 255, 0.1)'
    };

    const CHART_DEFAULTS = {
        font: 'Segoe UI, system-ui, sans-serif',
        fontSize: 12,
        padding: 40,
        barRadius: 4,
        animationDuration: 800
    };

    function drawBarChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = canvas.getBoundingClientRect();
        
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const dpr = window.devicePixelRatio || 1;
        const displayWidth = width;
        const displayHeight = height;

        ctx.clearRect(0, 0, displayWidth, displayHeight);

        const { labels, values, title, color = COLORS.accent } = data;
        const maxValue = Math.max(...values) * 1.1;

        const padding = { top: 40, right: 20, bottom: 50, left: 50 };
        const chartWidth = displayWidth - padding.left - padding.right;
        const chartHeight = displayHeight - padding.top - padding.bottom;

        ctx.fillStyle = COLORS.text;
        ctx.font = `bold ${CHART_DEFAULTS.fontSize + 2}px ${CHART_DEFAULTS.font}`;
        ctx.textAlign = 'center';
        ctx.fillText(title || '', displayWidth / 2, 20);

        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 1;
        
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartHeight / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(displayWidth - padding.right, y);
            ctx.stroke();

            const value = Math.round(maxValue - (maxValue / gridLines) * i);
            ctx.fillStyle = COLORS.textMuted;
            ctx.font = `${CHART_DEFAULTS.fontSize}px ${CHART_DEFAULTS.font}`;
            ctx.textAlign = 'right';
            ctx.fillText(value.toString(), padding.left - 10, y + 4);
        }

        const barWidth = (chartWidth / labels.length) * 0.7;
        const barGap = (chartWidth / labels.length) * 0.3;

        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, adjustColor(color, -30));

        labels.forEach((label, i) => {
            const x = padding.left + (chartWidth / labels.length) * i + barGap / 2;
            const barHeight = (values[i] / maxValue) * chartHeight;
            const y = padding.top + chartHeight - barHeight;

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, [CHART_DEFAULTS.barRadius, CHART_DEFAULTS.barRadius, 0, 0]);
            ctx.fill();

            ctx.fillStyle = COLORS.textMuted;
            ctx.font = `${CHART_DEFAULTS.fontSize}px ${CHART_DEFAULTS.font}`;
            ctx.textAlign = 'center';
            
            const labelText = label.length > 8 ? label.substring(0, 8) + '...' : label;
            ctx.fillText(labelText, x + barWidth / 2, displayHeight - padding.bottom + 20);
        });
    }

    function drawLineChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = canvas.getBoundingClientRect();
        
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const displayWidth = width;
        const displayHeight = height;

        ctx.clearRect(0, 0, displayWidth, displayHeight);

        const { labels, datasets, title } = data;
        const padding = { top: 40, right: 20, bottom: 50, left: 50 };
        const chartWidth = displayWidth - padding.left - padding.right;
        const chartHeight = displayHeight - padding.top - padding.bottom;

        ctx.fillStyle = COLORS.text;
        ctx.font = `bold ${CHART_DEFAULTS.fontSize + 2}px ${CHART_DEFAULTS.font}`;
        ctx.textAlign = 'center';
        ctx.fillText(title || '', displayWidth / 2, 20);

        const allValues = datasets.flatMap(d => d.values);
        const maxValue = Math.max(...allValues) * 1.1;
        const minValue = Math.min(...allValues) * 0.9;
        const valueRange = maxValue - minValue;

        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 1;
        
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartHeight / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(displayWidth - padding.right, y);
            ctx.stroke();

            const value = Math.round(maxValue - (valueRange / gridLines) * i);
            ctx.fillStyle = COLORS.textMuted;
            ctx.font = `${CHART_DEFAULTS.fontSize}px ${CHART_DEFAULTS.font}`;
            ctx.textAlign = 'right';
            ctx.fillText(value.toString(), padding.left - 10, y + 4);
        }

        const stepX = chartWidth / (labels.length - 1);

        datasets.forEach((dataset, datasetIndex) => {
            const color = dataset.color || COLORS.accent;
            const points = [];

            dataset.values.forEach((value, i) => {
                const x = padding.left + stepX * i;
                const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
                points.push({ x, y });
            });

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            points.forEach((point, i) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();

            const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
            gradient.addColorStop(0, color + '40');
            gradient.addColorStop(1, color + '05');
            
            ctx.beginPath();
            ctx.moveTo(points[0].x, padding.top + chartHeight);
            points.forEach(point => ctx.lineTo(point.x, point.y));
            ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            points.forEach((point, i) => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = displayWidth > 400 ? '#fff' : color;
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        });

        ctx.fillStyle = COLORS.textMuted;
        ctx.font = `${CHART_DEFAULTS.fontSize}px ${CHART_DEFAULTS.font}`;
        ctx.textAlign = 'center';
        
        const labelStep = Math.ceil(labels.length / 8);
        labels.forEach((label, i) => {
            if (i % labelStep === 0 || i === labels.length - 1) {
                const x = padding.left + stepX * i;
                ctx.fillText(label, x, displayHeight - padding.bottom + 20);
            }
        });
    }

    function drawPieChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = canvas.getBoundingClientRect();
        
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const displayWidth = width;
        const displayHeight = height;

        ctx.clearRect(0, 0, displayWidth, displayHeight);

        const { labels, values, title, colors } = data;
        const total = values.reduce((a, b) => a + b, 0);

        ctx.fillStyle = COLORS.text;
        ctx.font = `bold ${CHART_DEFAULTS.fontSize + 2}px ${CHART_DEFAULTS.font}`;
        ctx.textAlign = 'center';
        ctx.fillText(title || '', displayWidth / 2, 20);

        const centerX = displayWidth / 2;
        const centerY = displayHeight / 2 + 10;
        const radius = Math.min(displayWidth, displayHeight) / 2 - 50;
        const innerRadius = radius * 0.55;

        const chartColors = colors || [
            COLORS.primary,
            COLORS.accent,
            COLORS.warning,
            COLORS.danger,
            COLORS.success,
            COLORS.info
        ];

        let startAngle = -Math.PI / 2;

        values.forEach((value, i) => {
            const sliceAngle = (value / total) * Math.PI * 2;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
            ctx.closePath();
            
            ctx.fillStyle = chartColors[i % chartColors.length];
            ctx.fill();

            startAngle += sliceAngle;
        });

        const legendX = displayWidth - 80;
        const legendY = 50;
        const legendItemHeight = 20;

        labels.forEach((label, i) => {
            const y = legendY + i * legendItemHeight;
            
            ctx.fillStyle = chartColors[i % chartColors.length];
            ctx.fillRect(legendX, y, 12, 12);
            
            ctx.fillStyle = COLORS.textMuted;
            ctx.font = `${CHART_DEFAULTS.fontSize}px ${CHART_DEFAULTS.font}`;
            ctx.textAlign = 'left';
            ctx.fillText(`${Math.round((values[i] / total) * 100)}%`, legendX + 18, y + 10);
        });

        ctx.fillStyle = COLORS.text;
        ctx.font = `bold ${CHART_DEFAULTS.fontSize + 4}px ${CHART_DEFAULTS.font}`;
        ctx.textAlign = 'center';
        ctx.fillText(total.toString(), centerX, centerY + 5);
        
        ctx.fillStyle = COLORS.textMuted;
        ctx.font = `${CHART_DEFAULTS.fontSize}px ${CHART_DEFAULTS.font}`;
        ctx.fillText('Total', centerX, centerY + 20);
    }

    function adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    function getClaimsByRegion() {
        const claims = AgriGuard.getClaims();
        const regionData = {};
        
        AgriGuard.REGIONS.forEach(region => {
            regionData[region] = 0;
        });
        
        claims.forEach(claim => {
            if (regionData[claim.region] !== undefined) {
                regionData[claim.region]++;
            }
        });

        const labels = Object.keys(regionData);
        const values = Object.values(regionData);

        return {
            labels,
            values,
            title: 'Claims by Region',
            color: COLORS.accent
        };
    }

    function getFraudTrend() {
        const claims = AgriGuard.getClaims();
        const months = [];
        const fraudData = [];
        const approvedData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toLocaleString('default', { month: 'short' });
            months.push(monthKey);
            
            const monthClaims = claims.filter(c => {
                const claimDate = new Date(c.date);
                return claimDate.getMonth() === date.getMonth() && 
                       claimDate.getFullYear() === date.getFullYear();
            });
            
            const fraudCount = monthClaims.filter(c => c.aiResult && c.aiResult.fraudRisk > 60).length;
            const approvedCount = monthClaims.filter(c => c.status === 'approved').length;
            
            fraudData.push(fraudCount);
            approvedData.push(approvedCount);
        }

        return {
            labels: months,
            datasets: [
                { values: fraudData, color: COLORS.danger, label: 'High Risk' },
                { values: approvedData, color: COLORS.success, label: 'Approved' }
            ],
            title: 'Fraud Trend Analysis'
        };
    }

    function getDamageDistribution() {
        const claims = AgriGuard.getClaims();
        
        const ranges = {
            '0-25%': 0,
            '26-50%': 0,
            '51-75%': 0,
            '76-100%': 0
        };
        
        claims.forEach(claim => {
            if (claim.aiResult && claim.aiResult.damageScore !== undefined) {
                const score = claim.aiResult.damageScore;
                if (score <= 25) ranges['0-25%']++;
                else if (score <= 50) ranges['26-50%']++;
                else if (score <= 75) ranges['51-75%']++;
                else ranges['76-100%']++;
            }
        });

        return {
            labels: Object.keys(ranges),
            values: Object.values(ranges),
            title: 'Damage Distribution',
            colors: [COLORS.success, COLORS.warning, COLORS.accent, COLORS.danger]
        };
    }

    function getDashboardStats() {
        const claims = AgriGuard.getClaims();
        const transactions = AgriGuard.getTransactions();
        
        const totalClaims = claims.length;
        const approved = claims.filter(c => c.status === 'approved').length;
        const rejected = claims.filter(c => c.status === 'rejected').length;
        const pending = claims.filter(c => c.status === 'review' || c.status === 'pending').length;
        
        const totalPayout = transactions
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const avgScore = claims.length > 0 && claims.some(c => c.aiResult)
            ? claims.filter(c => c.aiResult).reduce((sum, c) => sum + c.aiResult.finalScore, 0) / claims.filter(c => c.aiResult).length
            : 0;

        const highRiskCount = claims.filter(c => c.aiResult && c.aiResult.fraudRisk > 60).length;

        return {
            totalClaims,
            approved,
            rejected,
            pending,
            totalPayout,
            avgScore: Math.round(avgScore * 10) / 10,
            highRiskCount,
            approvalRate: totalClaims > 0 ? Math.round((approved / totalClaims) * 100) : 0
        };
    }

    function initCharts() {
        setTimeout(() => {
            const claimsChart = document.getElementById('claims-region-chart');
            if (claimsChart) {
                drawBarChart('claims-region-chart', getClaimsByRegion());
            }

            const fraudChart = document.getElementById('fraud-trend-chart');
            if (fraudChart) {
                drawLineChart('fraud-trend-chart', getFraudTrend());
            }

            const damageChart = document.getElementById('damage-distribution-chart');
            if (damageChart) {
                drawPieChart('damage-distribution-chart', getDamageDistribution());
            }

            updateStatsCards();
        }, 100);
    }

    function updateStatsCards() {
        const stats = getDashboardStats();
        
        const totalClaimsEl = document.getElementById('stat-total-claims');
        const approvedEl = document.getElementById('stat-approved');
        const payoutEl = document.getElementById('stat-total-payout');
        const avgScoreEl = document.getElementById('stat-avg-score');

        if (totalClaimsEl) totalClaimsEl.textContent = stats.totalClaims;
        if (approvedEl) approvedEl.textContent = stats.approved;
        if (payoutEl) payoutEl.textContent = AgriGuard.formatCurrency(stats.totalPayout);
        if (avgScoreEl) avgScoreEl.textContent = stats.avgScore + '%';
    }

    function refreshAllCharts() {
        initCharts();
    }

    return {
        drawBarChart,
        drawLineChart,
        drawPieChart,
        getClaimsByRegion,
        getFraudTrend,
        getDamageDistribution,
        getDashboardStats,
        initCharts,
        updateStatsCards,
        refreshAllCharts,
        COLORS
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
}

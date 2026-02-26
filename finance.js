const FinanceEngine = (function() {
    'use strict';

    const BASE_RATES = {
        wheat: 20000,
        rice: 25000,
        cotton: 30000,
        corn: 18000,
        soybean: 22000,
        sugarcane: 28000
    };

    const HIGH_RISK_ZONES = ['Coastal Region', 'Hill Region'];
    const FRAUD_PENALTY_THRESHOLD = 60;
    const FRAUD_PENALTY_RATE = 0.10;
    const RELIEF_BONUS_RATE = 0.15;

    const BANK_IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const BANK_ACCOUNT_REGEX = /^\d{9,18}$/;

    function calculateCompensation(claimData, aiResult) {
        const { cropType, landSize, coveragePercent } = claimData;
        const { damageScore, fraudRisk } = aiResult;

        const baseRate = BASE_RATES[cropType.toLowerCase()] || 20000;
        
        const baseAmount = landSize * baseRate;
        
        const damageAdjusted = baseAmount * (damageScore / 100);
        
        let coverageAdjusted = damageAdjusted * (coveragePercent / 100);
        
        let finalAmount = coverageAdjusted;
        let adjustments = [];

        const isHighRisk = HIGH_RISK_ZONES.includes(claimData.region);
        if (isHighRisk) {
            const reliefBonus = coverageAdjusted * RELIEF_BONUS_RATE;
            finalAmount += reliefBonus;
            adjustments.push({
                type: 'relief_bonus',
                description: 'High Risk Zone Relief (15%)',
                amount: reliefBonus
            });
        }

        if (fraudRisk > FRAUD_PENALTY_THRESHOLD) {
            const fraudPenalty = finalAmount * FRAUD_PENALTY_RATE;
            finalAmount -= fraudPenalty;
            adjustments.push({
                type: 'fraud_penalty',
                description: 'Fraud Risk Penalty (10%)',
                amount: -fraudPenalty
            });
        }

        const breakdown = {
            baseAmount: Math.round(baseAmount),
            baseRate,
            landSize,
            cropType,
            damageScore,
            damageAdjusted: Math.round(damageAdjusted),
            coveragePercent,
            coverageAdjusted: Math.round(coverageAdjusted),
            adjustments,
            finalAmount: Math.round(finalAmount),
            isHighRiskZone: isHighRisk,
            fraudRisk
        };

        return breakdown;
    }

    function validateBankAccount(accountNumber) {
        if (!accountNumber) {
            return { valid: false, error: 'Account number is required' };
        }

        const cleaned = accountNumber.replace(/\s/g, '');
        
        if (!BANK_ACCOUNT_REGEX.test(cleaned)) {
            return { valid: false, error: 'Account number must be 9-18 digits' };
        }

        return { valid: true, cleaned };
    }

    function validateIFSC(ifscCode) {
        if (!ifscCode) {
            return { valid: false, error: 'IFSC code is required' };
        }

        const cleaned = ifscCode.replace(/\s/g, '').toUpperCase();
        
        if (!BANK_IFSC_REGEX.test(cleaned)) {
            return { valid: false, error: 'Invalid IFSC code format (e.g., SBIN0001234)' };
        }

        return { valid: true, cleaned };
    }

    function validatePaymentDetails(paymentData) {
        const errors = {};

        const accountResult = validateBankAccount(paymentData.accountNumber);
        if (!accountResult.valid) {
            errors.accountNumber = accountResult.error;
        }

        if (paymentData.ifscCode) {
            const ifscResult = validateIFSC(paymentData.ifscCode);
            if (!ifscResult.valid) {
                errors.ifscCode = ifscResult.error;
            }
        }

        if (!paymentData.accountHolder || paymentData.accountHolder.trim().length < 2) {
            errors.accountHolder = 'Account holder name is required';
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors,
            sanitized: {
                accountNumber: accountResult.cleaned,
                ifscCode: paymentData.ifscCode ? paymentData.ifscCode.toUpperCase() : '',
                accountHolder: paymentData.accountHolder.trim()
            }
        };
    }

    function checkDuplicatePayment(claimId) {
        const transactions = AgriGuard.getTransactions();
        return transactions.some(t => t.claimId === claimId && t.status === 'completed');
    }

    async function processPayment(claimData, compensation, paymentDetails) {
        const validation = validatePaymentDetails(paymentDetails);
        
        if (!validation.valid) {
            return {
                success: false,
                error: 'Validation failed',
                errors: validation.errors
            };
        }

        if (checkDuplicatePayment(claimData.id)) {
            return {
                success: false,
                error: 'Payment has already been processed for this claim'
            };
        }

        await AgriGuard.sleep(1500);

        const willFail = Math.random() < 0.1;
        
        if (willFail) {
            return {
                success: false,
                error: 'Payment processing failed. Please try again.',
                retryable: true
            };
        }

        const transaction = {
            id: AgriGuard.generateTransactionId(),
            claimId: claimData.id,
            farmerId: claimData.farmerId,
            farmerName: claimData.farmerName,
            cropType: AgriGuard.getCropName(claimData.cropType),
            landSize: claimData.landSize,
            bankAccount: maskAccountNumber(validation.sanitized.accountNumber),
            accountHolder: validation.sanitized.accountHolder,
            ifscCode: validation.sanitized.ifscCode,
            amount: compensation.finalAmount,
            breakdown: compensation,
            status: 'completed',
            date: new Date().toISOString(),
            processedAt: new Date().toISOString()
        };

        AgriGuard.saveTransaction(transaction);

        const claim = AgriGuard.getClaimById(claimData.id);
        if (claim) {
            claim.status = 'approved';
            claim.payoutStatus = 'completed';
            claim.transactionId = transaction.id;
            claim.payoutAmount = compensation.finalAmount;
            AgriGuard.saveClaim(claim);
        }

        return {
            success: true,
            transaction,
            receipt: generateReceiptData(transaction)
        };
    }

    async function retryPayment(claimData, compensation, paymentDetails) {
        await AgriGuard.sleep(2000);
        
        const willFail = Math.random() < 0.2;
        
        if (willFail) {
            return {
                success: false,
                error: 'Payment still failing. Please contact support.',
                retryable: false
            };
        }

        return processPayment(claimData, compensation, paymentDetails);
    }

    function maskAccountNumber(accountNumber) {
        if (!accountNumber || accountNumber.length < 4) return '****';
        const last4 = accountNumber.slice(-4);
        return `XXXX${last4}`;
    }

    function generateReceiptData(transaction) {
        return {
            transactionId: transaction.id,
            claimId: transaction.claimId,
            farmerName: transaction.farmerName,
            cropType: transaction.cropType,
            landSize: transaction.landSize,
            bankAccount: transaction.bankAccount,
            amount: transaction.amount,
            date: transaction.date
        };
    }

    function getPaymentStatus(claimId) {
        const claim = AgriGuard.getClaimById(claimId);
        if (!claim) return null;

        if (claim.payoutStatus === 'completed') {
            const transaction = AgriGuard.getTransactionByClaimId(claimId);
            return {
                status: 'completed',
                transactionId: transaction?.id,
                amount: claim.payoutAmount,
                date: transaction?.processedAt
            };
        }

        if (claim.payoutStatus === 'processing') {
            return {
                status: 'processing',
                message: 'Payment is being processed'
            };
        }

        return {
            status: 'pending',
            message: 'Payment not yet initiated'
        };
    }

    function getTotalPayouts(filters = {}) {
        const transactions = AgriGuard.getTransactions();
        
        let filtered = transactions.filter(t => t.status === 'completed');
        
        if (filters.region) {
            const claims = AgriGuard.getClaims();
            const regionClaims = claims.filter(c => c.region === filters.region);
            const regionClaimIds = new Set(regionClaims.map(c => c.id));
            filtered = filtered.filter(t => regionClaimIds.has(t.claimId));
        }

        if (filters.startDate) {
            filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate));
        }

        return {
            total: filtered.length,
            amount: filtered.reduce((sum, t) => sum + t.amount, 0),
            average: filtered.length > 0 ? filtered.reduce((sum, t) => sum + t.amount, 0) / filtered.length : 0,
            transactions: filtered
        };
    }

    function getCompensationBreakdown(claimId) {
        const claim = AgriGuard.getClaimById(claimId);
        if (!claim || !claim.aiResult) return null;

        return calculateCompensation(claim, claim.aiResult);
    }

    function formatCompensationSummary(breakdown) {
        const lines = [
            `Base Amount: ${AgriGuard.formatCurrency(breakdown.baseAmount)}`,
            `  (${breakdown.landSize} acres × ${AgriGuard.formatCurrency(breakdown.baseRate)}/acre)`,
            ``,
            `Damage Adjusted: ${AgriGuard.formatCurrency(breakdown.damageAdjusted)}`,
            `  (${breakdown.damageScore}% damage)`,
            ``,
            `Coverage Applied: ${AgriGuard.formatCurrency(breakdown.coverageAdjusted)}`,
            `  (${breakdown.coveragePercent}% coverage)`,
            ``
        ];

        if (breakdown.adjustments.length > 0) {
            breakdown.adjustments.forEach(adj => {
                const sign = adj.amount >= 0 ? '+' : '';
                lines.push(`${adj.description}: ${sign}${AgriGuard.formatCurrency(adj.amount)}`);
            });
            lines.push('');
        }

        lines.push(`Final Amount: ${AgriGuard.formatCurrency(breakdown.finalAmount)}`);

        return lines.join('\n');
    }

    return {
        calculateCompensation,
        validateBankAccount,
        validateIFSC,
        validatePaymentDetails,
        checkDuplicatePayment,
        processPayment,
        retryPayment,
        maskAccountNumber,
        generateReceiptData,
        getPaymentStatus,
        getTotalPayouts,
        getCompensationBreakdown,
        formatCompensationSummary,
        BASE_RATES,
        HIGH_RISK_ZONES,
        FRAUD_PENALTY_THRESHOLD,
        FRAUD_PENALTY_RATE,
        RELIEF_BONUS_RATE
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinanceEngine;
}

const AIEngine = (function() {
    'use strict';

    const WEIGHTS = {
        DAMAGE: 0.35,
        WEATHER: 0.25,
        SOIL: 0.15,
        TRUST: 0.15,
        FRAUD_INVERSE: 0.10
    };

    const DECISION_THRESHOLDS = {
        APPROVED: 75,
        REVIEW: 50
    };

    const WEATHER_CONDITIONS = [
        { name: 'Drought', severity: 0.9 },
        { name: 'Flood', severity: 0.85 },
        { name: 'Heavy Rain', severity: 0.6 },
        { name: 'Storm', severity: 0.5 },
        { name: 'Heatwave', severity: 0.8 },
        { name: 'Frost', severity: 0.75 },
        { name: 'Normal', severity: 0.1 }
    ];

    const SOIL_TYPES = [
        { name: 'Clay', risk: 0.3 },
        { name: 'Sandy', risk: 0.4 },
        { name: 'Loamy', risk: 0.2 },
        { name: 'Silty', risk: 0.25 },
        { name: 'Peaty', risk: 0.35 },
        { name: 'Chalky', risk: 0.45 }
    ];

    const CROP_VULNERABILITY = {
        wheat: { drought: 0.9, flood: 0.7, storm: 0.4, heatwave: 0.85 },
        rice: { drought: 0.3, flood: 0.9, storm: 0.6, heatwave: 0.5 },
        cotton: { drought: 0.7, flood: 0.5, storm: 0.3, heatwave: 0.8 },
        corn: { drought: 0.8, flood: 0.6, storm: 0.5, heatwave: 0.85 },
        soybean: { drought: 0.7, flood: 0.65, storm: 0.45, heatwave: 0.75 },
        sugarcane: { drought: 0.6, flood: 0.5, storm: 0.35, heatwave: 0.7 }
    };

    let mockWeatherCache = null;

    function calculateDamageScore(claimData) {
        const { cropType, landSize, imageCount, description } = claimData;
        
        let score = 0;
        
        const baseDamage = 30 + Math.random() * 35;
        
        const landSizeFactor = Math.min(landSize / 10, 1) * 15;
        
        const imageFactor = Math.min(imageCount / 3, 1) * 20;
        
        let vulnerabilityFactor = 0.5;
        if (CROP_VULNERABILITY[cropType]) {
            const vulnerabilities = CROP_VULNERABILITY[cropType];
            vulnerabilityFactor = Object.values(vulnerabilities).reduce((a, b) => a + b, 0) / 4;
        }
        
        score = (baseDamage * 0.4) + (landSizeFactor * 0.3) + (imageFactor * 0.2) + (vulnerabilityFactor * 10);
        
        if (description && description.length > 50) {
            score += 5;
        }
        
        score = Math.max(10, Math.min(100, score));
        
        return Math.round(score * 10) / 10;
    }

    function calculateWeatherMatch(claimData, weatherData) {
        const { cropType, date, region } = claimData;
        
        const claimMonth = new Date(date).getMonth();
        const seasonalWeather = getSeasonalWeather(claimMonth);
        
        let matchScore = 0;
        
        if (weatherData) {
            const weatherSeverity = weatherData.severity || 0.5;
            const expectedSeverity = seasonalWeather.severity;
            
            const difference = Math.abs(weatherSeverity - expectedSeverity);
            matchScore = (1 - difference) * 100;
        } else {
            const randomVariation = Math.random() * 20;
            matchScore = 60 + randomVariation;
        }
        
        if (CROP_VULNERABILITY[cropType]) {
            const vulnerabilities = CROP_VULNERABILITY[cropType];
            const weatherKey = seasonalWeather.type.toLowerCase();
            if (vulnerabilities[weatherKey]) {
                const vulnerabilityBonus = vulnerabilities[weatherKey] * 20;
                matchScore = Math.min(100, matchScore + vulnerabilityBonus);
            }
        }
        
        matchScore = Math.max(20, Math.min(100, matchScore));
        
        return Math.round(matchScore * 10) / 10;
    }

    function getSeasonalWeather(month) {
        const seasonMap = [
            { type: 'Winter', severity: 0.3 },
            { type: 'Winter', severity: 0.2 },
            { type: 'Spring', severity: 0.3 },
            { type: 'Spring', severity: 0.4 },
            { type: 'Summer', severity: 0.7 },
            { type: 'Summer', severity: 0.8 },
            { type: 'Monsoon', severity: 0.85 },
            { type: 'Monsoon', severity: 0.9 },
            { type: 'Monsoon', severity: 0.8 },
            { type: 'Autumn', severity: 0.4 },
            { type: 'Autumn', severity: 0.3 },
            { type: 'Winter', severity: 0.25 }
        ];
        
        return seasonMap[month] || { type: 'Normal', severity: 0.4 };
    }

    function calculateFraudRisk(claimData, historicalClaims = []) {
        const { farmerId, cropType, landSize, imageCount, date, bankAccount } = claimData;
        
        let riskScore = 0;
        
        if (historicalClaims.length > 0) {
            const recentClaims = historicalClaims.filter(c => {
                const claimDate = new Date(c.date);
                const monthsDiff = (new Date() - claimDate) / (1000 * 60 * 60 * 24 * 30);
                return monthsDiff < 6;
            });
            
            if (recentClaims.length > 3) {
                riskScore += 25;
            }
            
            const sameCropClaims = recentClaims.filter(c => c.cropType === cropType);
            if (sameCropClaims.length > 2) {
                riskScore += 20;
            }
        }
        
        if (landSize > 50) {
            riskScore += 15;
        }
        
        if (imageCount < 2) {
            riskScore += 10;
        } else if (imageCount > 10) {
            riskScore += 5;
        }
        
        const claimDate = new Date(date);
        const daysSinceClaim = (new Date() - claimDate) / (1000 * 60 * 60 * 24);
        if (daysSinceClaim > 30) {
            riskScore += 10;
        }
        
        if (bankAccount) {
            const bankPrefix = bankAccount.substring(0, 4);
            if (bankPrefix === '0000' || bankPrefix === '1111') {
                riskScore += 15;
            }
        }
        
        riskScore = Math.max(0, Math.min(100, riskScore));
        
        return Math.round(riskScore * 10) / 10;
    }

    function calculateTrustModifier(farmerId, historicalClaims = []) {
        let trustScore = 50;
        
        if (historicalClaims.length === 0) {
            return 50;
        }
        
        const approved = historicalClaims.filter(c => c.status === 'approved').length;
        const rejected = historicalClaims.filter(c => c.status === 'rejected').length;
        const total = historicalClaims.length;
        
        const approvalRate = approved / total;
        
        trustScore = approvalRate * 100;
        
        if (rejected > 0) {
            const rejectionPenalty = (rejected / total) * 30;
            trustScore -= rejectionPenalty;
        }
        
        const recentClaims = historicalClaims.filter(c => {
            const claimDate = new Date(c.date);
            const monthsDiff = (new Date() - claimDate) / (1000 * 60 * 60 * 24 * 30);
            return monthsDiff < 3;
        });
        
        if (recentClaims.length > 2) {
            trustScore -= 10;
        }
        
        trustScore = Math.max(0, Math.min(100, trustScore));
        
        return Math.round(trustScore * 10) / 10;
    }

    function calculateSoilFactor(region) {
        const soilByRegion = {
            'North District': 'Loamy',
            'South District': 'Clay',
            'East District': 'Sandy',
            'West District': 'Silty',
            'Central District': 'Loamy',
            'Coastal Region': 'Silty',
            'Hill Region': 'Peaty',
            'Plain Region': 'Sandy'
        };
        
        const soilType = soilByRegion[region] || 'Loamy';
        const soil = SOIL_TYPES.find(s => s.name === soilType);
        
        return soil ? (1 - soil.risk) * 100 : 70;
    }

    async function getWeatherData(region) {
        if (mockWeatherCache) {
            return mockWeatherCache;
        }

        await sleep(100);
        
        const randomWeather = WEATHER_CONDITIONS[Math.floor(Math.random() * (WEATHER_CONDITIONS.length - 1))];
        
        mockWeatherCache = {
            condition: randomWeather.name,
            severity: randomWeather.severity,
            humidity: Math.round(40 + Math.random() * 50),
            temperature: Math.round(20 + Math.random() * 20),
            windSpeed: Math.round(5 + Math.random() * 25),
            rainfall: Math.round(Math.random() * 100)
        };
        
        return mockWeatherCache;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function calculateFinalScore(claimData, historicalClaims = []) {
        const damageScore = calculateDamageScore(claimData);
        const weatherData = getWeatherDataSync(claimData.region);
        const weatherMatch = calculateWeatherMatch(claimData, weatherData);
        const soilFactor = calculateSoilFactor(claimData.region);
        const trustModifier = calculateTrustModifier(claimData.farmerId, historicalClaims);
        const fraudRisk = calculateFraudRisk(claimData, historicalClaims);
        
        const fraudInverse = 100 - fraudRisk;
        
        const finalScore = (
            (WEIGHTS.DAMAGE * damageScore) +
            (WEIGHTS.WEATHER * weatherMatch) +
            (WEIGHTS.SOIL * soilFactor) +
            (WEIGHTS.TRUST * trustModifier) +
            (WEIGHTS.FRAUD_INVERSE * fraudInverse)
        );
        
        const roundedScore = Math.round(finalScore * 10) / 10;
        
        return {
            damageScore,
            weatherMatch,
            soilFactor,
            trustModifier,
            fraudRisk,
            finalScore: roundedScore,
            decision: getDecision(roundedScore),
            weatherData,
            weights: WEIGHTS,
            thresholds: DECISION_THRESHOLDS
        };
    }

    function getWeatherDataSync(region) {
        const randomWeather = WEATHER_CONDITIONS[Math.floor(Math.random() * (WEATHER_CONDITIONS.length - 1))];
        return {
            condition: randomWeather.name,
            severity: randomWeather.severity,
            humidity: Math.round(40 + Math.random() * 50),
            temperature: Math.round(20 + Math.random() * 20),
            windSpeed: Math.round(5 + Math.random() * 25),
            rainfall: Math.round(Math.random() * 100)
        };
    }

    function getDecision(score) {
        if (score >= DECISION_THRESHOLDS.APPROVED) {
            return 'approved';
        } else if (score >= DECISION_THRESHOLDS.REVIEW) {
            return 'review';
        } else {
            return 'rejected';
        }
    }

    function getDecisionExplanation(result) {
        const explanations = {
            approved: `Your claim has been approved with a score of ${result.finalScore}. ` +
                `The AI analysis confirmed ${result.damageScore}% crop damage consistent with ` +
                `${result.weatherData?.condition || 'local weather conditions'}. ` +
                `All verification checks passed with a fraud risk of only ${result.fraudRisk}%.`,
            
            review: `Your claim requires manual review with a score of ${result.finalScore}. ` +
                `The AI detected ${result.damageScore}% damage but found some discrepancies ` +
                `in weather matching (${result.weatherMatch}%). ` +
                `Fraud risk assessment shows ${result.fraudRisk}% - please provide additional documentation if available.`,
            
            rejected: `Your claim has been rejected with a score of ${result.finalScore}. ` +
                `The AI analysis could not confirm sufficient damage (${result.damageScore}%) ` +
                `or found high fraud risk indicators (${result.fraudRisk}%). ` +
                `Consider appealing with additional evidence or contacting support.`
        };
        
        return explanations[result.decision];
    }

    async function processClaim(claimData, onStageComplete) {
        const historicalClaims = AgriGuard.getClaims().filter(c => c.farmerId === claimData.farmerId);
        
        const stages = [
            { name: 'Damage Analysis', duration: 1500 },
            { name: 'Weather Matching', duration: 1200 },
            { name: 'Risk Assessment', duration: 1000 },
            { name: 'Fraud Detection', duration: 800 }
        ];
        
        for (let i = 0; i < stages.length; i++) {
            if (onStageComplete) {
                await onStageComplete(stages[i].name, i, stages.length);
            }
            await sleep(stages[i].duration);
        }
        
        const result = calculateFinalScore(claimData, historicalClaims);
        
        return result;
    }

    function getConfidenceLevel(score) {
        if (score >= 85) return { level: 'Very High', percentage: 90 + Math.random() * 8 };
        if (score >= 70) return { level: 'High', percentage: 75 + Math.random() * 15 };
        if (score >= 50) return { level: 'Medium', percentage: 55 + Math.random() * 20 };
        return { level: 'Low', percentage: 30 + Math.random() * 20 };
    }

    function analyzeImage(imageData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const hasDamage = Math.random() > 0.2;
                const damagePercentage = hasDamage ? 
                    Math.round(20 + Math.random() * 70) : 
                    Math.round(Math.random() * 15);
                
                resolve({
                    hasDamage,
                    damagePercentage,
                    confidence: Math.round(70 + Math.random() * 25),
                    detectedFeatures: hasDamage ? [
                        'Leaf discoloration',
                        'Wilting patterns',
                        'Unusual growth patterns'
                    ] : [
                        'Healthy foliage',
                        'Normal coloration'
                    ]
                });
            }, 500);
        });
    }

    return {
        calculateDamageScore,
        calculateWeatherMatch,
        calculateFraudRisk,
        calculateTrustModifier,
        calculateSoilFactor,
        calculateFinalScore,
        getDecision,
        getDecisionExplanation,
        processClaim,
        getConfidenceLevel,
        analyzeImage,
        getWeatherData,
        WEIGHTS,
        DECISION_THRESHOLDS,
        WEATHER_CONDITIONS,
        SOIL_TYPES,
        CROP_VULNERABILITY
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIEngine;
}

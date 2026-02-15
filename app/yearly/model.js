// SOFI Stock Evaluation Model - 2030 Forecast
// Financial data and calculations
// Updated with new visual layout

// Utility function to update slider fill based on value
function updateSliderFill(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const value = parseFloat(slider.value);
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #00A5E5 0%, #00A5E5 ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`;
}

// Initialize all slider fills on page load
function initializeAllSliderFills() {
    const sliders = document.querySelectorAll('.filters-vertical-list input[type="range"]');
    sliders.forEach(slider => {
        updateSliderFill(slider);
        slider.addEventListener('input', function() {
            updateSliderFill(this);
        });
    });
}

// Base data (2024)
const BASE_DATA = {
    currentPrice: 20.86,
    sharesOutstanding: 1.251767, // Billions
    revenue2024: 2600.000, // In thousands (millions) - from 2024 data
    members2024: 10.127 // Millions (10,127,000 absolute = 10.127M)
};

// Historical Data (2020-2024) - Past Performance
const HISTORICAL_DATA = {
    2020: {
        revenue: 565532,
        netIncome: null,
        eps: null,
        salesMarketing: 276577,
        salesMarketingPercent: 49,
        costPerMember: null,
        newMemberAdds: null,
        clientCount: 1851000,
        memberGrowthRate: null
    },
    2021: {
        revenue: 1010872,
        netIncome: null,
        eps: null,
        salesMarketing: 426875,
        salesMarketingPercent: 42,
        costPerMember: 265,
        newMemberAdds: 1609000,
        clientCount: 3460000,
        memberGrowthRate: 86.93
    },
    2022: {
        revenue: 1573535,
        netIncome: null,
        eps: null,
        salesMarketing: 617823,
        salesMarketingPercent: 39,
        costPerMember: 350,
        newMemberAdds: 1763000,
        clientCount: 5223000,
        memberGrowthRate: 50.95
    },
    2023: {
        revenue: 2122789,
        netIncome: null,
        eps: null,
        salesMarketing: 719400,
        salesMarketingPercent: 34,
        costPerMember: 311,
        newMemberAdds: 2310009,
        clientCount: 7542000,
        memberGrowthRate: 44.40
    },
    2024: {
        revenue: 2600000,
        netIncome: 227000,
        eps: 0.15,
        salesMarketing: 796293,
        salesMarketingPercent: 31,
        costPerMember: 308,
        newMemberAdds: 2585000,
        clientCount: 10127000,
        memberGrowthRate: 34.27
    }
};

// Guidance Data (2025) - Official Company Guidance
const GUIDANCE_DATA = {
    2025: {
        revenue: 3600000,
        netIncome: 480000,
        eps: 0.39,
        salesMarketing: 1137700,
        salesMarketingPercent: 31,
        costPerMember: 313,
        newMemberAdds: 3500952,
        clientCount: 13627952,
        memberGrowthRate: 34.57
    }
};

// Projection Data (2026-2030)
const PROJECTION_DATA = {
    2026: {
        revenue: 4779101,
        netIncome: 1026426,
        eps: 0.82,
        salesMarketing: 1386039,
        salesMarketingPercent: 29,
        costPerMember: 300,
        newMemberAdds: 4460495,
        clientCount: 18088447,
        memberGrowthRate: 32.73
    },
    2027: {
        revenue: 6451787,
        netIncome: 1741983,
        eps: 1.38,
        salesMarketing: 1741983,
        salesMarketingPercent: 27,
        costPerMember: 300,
        newMemberAdds: 5697461,
        clientCount: 23785908,
        memberGrowthRate: 31.50
    },
    2028: {
        revenue: 8580876,
        netIncome: 2574263,
        eps: 2.04,
        salesMarketing: 2059410,
        salesMarketingPercent: 24,
        costPerMember: 275,
        newMemberAdds: 7268685,
        clientCount: 31054593,
        memberGrowthRate: 30.58
    },
    2029: {
        revenue: 11412565,
        netIncome: 3766146,
        eps: 2.99,
        salesMarketing: 2510764,
        salesMarketingPercent: 22,
        costPerMember: 275,
        newMemberAdds: 9036886,
        clientCount: 40091479,
        memberGrowthRate: 29.10
    },
    2030: {
        revenue: 15064586,
        netIncome: 5272606,
        eps: 4.22,
        salesMarketing: 3012917,
        salesMarketingPercent: 20,
        costPerMember: 244,
        newMemberAdds: 11466155,
        clientCount: 51557634,
        memberGrowthRate: 28.57
    }
};

// Model Assumptions
const MODEL_ASSUMPTIONS = {
    revenueGrowth2025: 36,
    revenueGrowth2026: 38.9,
    revenueGrowth2027: 34,
    revenueGrowth2028: 34,
    revenueGrowth2029: 32,
    revenueGrowth2030: 30,
    peRatio2025: 47,
    peRatio2026: 50,
    peRatio2027: 47,
    peRatio2028: 45,
    peRatio2029: 43,
    peRatio2030: 41,
    sharesOutstanding2030: 1.251767
};

// Chart instances
let revenueChart, profitabilityChart, memberChart, scenarioChart, epsChart;
let salesMarketingChart, salesMarketingPercentChart, memberAcquisitionChart, marketCapChart;
let memberGrowthChart, peRatioChart, revenueGrowthChart, netIncomeMarginChart;

// Initialize model
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeCharts();
        initializeSliders();
        
        // Sync PROJECTION_DATA with default slider values immediately
        updateModelWithSliders();
        
        updateCurrentStockPrice();
        
        // Initialize filled slider styles
        setTimeout(function() {
            initializeAllSliderFills();
        }, 100);
    } catch(e) {
        console.error('Error during initialization:', e);
    }
});

// Update all charts and KPIs
function updateAllChartsWithData(projections) {
    if (!projections || projections.length === 0) return;
    
    const years = projections.map(p => p.year.toString());
    const finalYear = projections[projections.length - 1];
    
    // Update KPI cards
    const valuation = calculatePEValuation(projections);
    document.getElementById('projectedPrice').textContent = `$${valuation.price.toFixed(2)}`;
    
    // Calculate and display upside percentage
    updateUpsidePercentage(valuation.price);
    
    document.getElementById('marketCap').textContent = `$${valuation.marketCap.toFixed(2)}B`;
    document.getElementById('revenue2030').textContent = `$${(finalYear.revenue / 1000000).toFixed(2)}B`;
    document.getElementById('netIncome2030').textContent = finalYear.netIncome ? `$${(finalYear.netIncome / 1000000).toFixed(2)}B` : 'N/A';
    document.getElementById('eps2030').textContent = `$${finalYear.eps.toFixed(2)}`;
    document.getElementById('members2030').textContent = `${(finalYear.clientCount / 1000000).toFixed(1)}M`;
    
    // Update charts
    if (revenueChart) {
        revenueChart.data.labels = years;
        revenueChart.data.datasets[0].data = projections.map(p => p.revenue / 1000000);
        revenueChart.update();
    }
    
    if (scenarioChart) {
        const trends = calculateScenarioTrends(projections);
        const filtered = trends.years.map((y, i) => y >= 2025 ? i : -1).filter(i => i !== -1);
        scenarioChart.data.labels = filtered.map(i => trends.years[i].toString());
        scenarioChart.data.datasets[0].data = filtered.map(i => trends.years[i] === 2025 ? 26 : trends.prices[i]);
        scenarioChart.update();
    }
    
    if (marketCapChart) {
        const trends = calculateMarketCapTrends(projections);
        const filtered = trends.years.map((y, i) => y >= 2025 ? i : -1).filter(i => i !== -1);
        marketCapChart.data.labels = filtered.map(i => trends.years[i].toString());
        marketCapChart.data.datasets[0].data = filtered.map(i => trends.years[i] === 2025 ? 32 : trends.marketCaps[i]);
        marketCapChart.update();
    }
    
    if (memberChart) {
        memberChart.data.labels = years;
        memberChart.data.datasets[0].data = projections.map(p => p.clientCount / 1000000);
        memberChart.update();
    }
    
    if (profitabilityChart) {
        profitabilityChart.data.labels = years;
        profitabilityChart.data.datasets[0].data = projections.map(p => p.netIncome ? p.netIncome / 1000000 : null);
        profitabilityChart.update();
    }
    
    if (epsChart) {
        epsChart.data.labels = years;
        epsChart.data.datasets[0].data = projections.map(p => p.eps);
        epsChart.update();
    }
    
    if (salesMarketingChart) {
        salesMarketingChart.data.labels = years;
        salesMarketingChart.data.datasets[0].data = projections.map(p => (p.salesMarketing || 0) / 1000000);
        salesMarketingChart.update();
    }
    
    if (salesMarketingPercentChart) {
        salesMarketingPercentChart.data.labels = years;
        salesMarketingPercentChart.data.datasets[0].data = projections.map(p => p.salesMarketingPercent || 0);
        salesMarketingPercentChart.update();
    }
    
    if (memberAcquisitionChart) {
        memberAcquisitionChart.data.labels = years;
        memberAcquisitionChart.data.datasets[0].data = projections.map(p => p.costPerMember);
        memberAcquisitionChart.update();
    }
    
    if (memberGrowthChart) {
        memberGrowthChart.data.labels = years;
        memberGrowthChart.data.datasets[0].data = projections.map(p => p.memberGrowthRate);
        memberGrowthChart.update();
    }
    
    if (peRatioChart) {
        peRatioChart.data.labels = years;
        peRatioChart.data.datasets[0].data = projections.map(p => {
            if (p.year >= 2025 && p.year <= 2030) {
                return MODEL_ASSUMPTIONS['peRatio' + p.year] || null;
            }
            return null;
        });
        peRatioChart.update();
    }
    
    if (revenueGrowthChart) {
        const filtered = projections.filter(p => p.year >= 2026);
        revenueGrowthChart.data.labels = filtered.map(p => p.year.toString());
        revenueGrowthChart.data.datasets[0].data = filtered.map(p => p.revenueGrowth);
        revenueGrowthChart.update();
    }
    
    if (netIncomeMarginChart) {
        netIncomeMarginChart.data.labels = years;
        netIncomeMarginChart.data.datasets[0].data = projections.map(p => {
            if (p.netIncome && p.netIncome > 0 && p.revenue > 0) {
                return (p.netIncome / p.revenue) * 100;
            }
            return null;
        });
        netIncomeMarginChart.update();
    }
    
    updateProjectionsTable(projections);
    updateSegmentRevenueTable();
    updateAssumptions();
}

// Initialize sliders
function initializeSliders() {
    const container = document.getElementById('yearControlsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const defaultValues = {
        2026: { revenueGrowth: 38.9, peRatio: 50, netIncomeMargin: 20.0, salesMarketing: 30.0, memberGrowth: 32.73 },
        2027: { revenueGrowth: 34.0, peRatio: 47, netIncomeMargin: 25.3, salesMarketing: 27.0, memberGrowth: 31.50 },
        2028: { revenueGrowth: 34.0, peRatio: 45, netIncomeMargin: 27.4, salesMarketing: 24.0, memberGrowth: 30.58 },
        2029: { revenueGrowth: 32.0, peRatio: 43, netIncomeMargin: 29.1, salesMarketing: 22.0, memberGrowth: 29.10 },
        2030: { revenueGrowth: 30.0, peRatio: 41, netIncomeMargin: 30.0, salesMarketing: 20.0, memberGrowth: 28.57 }
    };
    
    const sliderTypes = [
        { id: 'revGrowth', label: 'Revenue Growth%', min: 20, max: 50, step: 0.01, format: (v) => parseFloat(v).toFixed(1) + '%' },
        { id: 'netMargin', label: 'Net Income %', min: 15, max: 45, step: 0.1, format: (v) => parseFloat(v).toFixed(1) + '%' },
        { id: 'memberGrowth', label: 'Member Growth%', min: 15, max: 40, step: 0.1, format: (v) => parseFloat(v).toFixed(2) + '%' },
        { id: 'peRatio', label: 'FWD P/E Ratio', min: 30, max: 60, step: 1, format: (v) => v + 'x' },
        { id: 'salesMkt', label: 'Sales & Marketing%', min: 10, max: 35, step: 0.5, format: (v) => parseFloat(v).toFixed(1) + '%' }
    ];
    
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'filters-vertical-list';
    
    sliderTypes.forEach(slider => {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';
        
        const labelDiv = document.createElement('div');
        labelDiv.className = 'filter-label-header';
        labelDiv.textContent = slider.label;
        filterContainer.appendChild(labelDiv);
        
        for (let year = 2026; year <= 2030; year++) {
            const yearRow = document.createElement('div');
            yearRow.className = 'year-row';
            
            const yearLabel = document.createElement('div');
            yearLabel.className = 'year-label';
            yearLabel.textContent = year;
            yearRow.appendChild(yearLabel);
            
            const sliderGroup = document.createElement('div');
            sliderGroup.className = 'slider-group-horizontal';
            const defaultValue = defaultValues[year][slider.id === 'revGrowth' ? 'revenueGrowth' : 
                                                      slider.id === 'peRatio' ? 'peRatio' :
                                                      slider.id === 'netMargin' ? 'netIncomeMargin' :
                                                      slider.id === 'salesMkt' ? 'salesMarketing' : 'memberGrowth'];
            
            sliderGroup.innerHTML = `
                <span class="slider-value" id="${slider.id}${year}Value">${slider.format(defaultValue)}</span>
                <input type="range" id="${slider.id}${year}" min="${slider.min}" max="${slider.max}" value="${defaultValue}" step="${slider.step}">
            `;
            yearRow.appendChild(sliderGroup);
            
            const sliderElement = sliderGroup.querySelector(`#${slider.id}${year}`);
            sliderElement.addEventListener('input', function() {
                document.getElementById(`${slider.id}${year}Value`).textContent = slider.format(this.value);
                updateModelWithSliders();
            });
            
            filterContainer.appendChild(yearRow);
        }
        
        filtersContainer.appendChild(filterContainer);
    });
    
    container.appendChild(filtersContainer);
}

// Reset controls
function resetControls() {
    const defaultValues = {
        2026: { revenueGrowth: 38.9, peRatio: 50, netIncomeMargin: 20.0, salesMarketing: 30.0, memberGrowth: 32.73 },
        2027: { revenueGrowth: 34.0, peRatio: 47, netIncomeMargin: 25.3, salesMarketing: 27.0, memberGrowth: 31.50 },
        2028: { revenueGrowth: 34.0, peRatio: 45, netIncomeMargin: 27.4, salesMarketing: 24.0, memberGrowth: 30.58 },
        2029: { revenueGrowth: 32.0, peRatio: 43, netIncomeMargin: 29.1, salesMarketing: 22.0, memberGrowth: 29.10 },
        2030: { revenueGrowth: 30.0, peRatio: 41, netIncomeMargin: 30.0, salesMarketing: 20.0, memberGrowth: 28.57 }
    };
    
    const sliderTypes = [
        { id: 'revGrowth', key: 'revenueGrowth', format: (v) => parseFloat(v).toFixed(1) + '%' },
        { id: 'netMargin', key: 'netIncomeMargin', format: (v) => parseFloat(v).toFixed(1) + '%' },
        { id: 'salesMkt', key: 'salesMarketing', format: (v) => parseFloat(v).toFixed(1) + '%' },
        { id: 'memberGrowth', key: 'memberGrowth', format: (v) => parseFloat(v).toFixed(2) + '%' },
        { id: 'peRatio', key: 'peRatio', format: (v) => v + 'x' }
    ];
    
    for (let year = 2026; year <= 2030; year++) {
        const defaults = defaultValues[year];
        sliderTypes.forEach(slider => {
            const value = defaults[slider.key];
            const el = document.getElementById(`${slider.id}${year}`);
            const valEl = document.getElementById(`${slider.id}${year}Value`);
            if (el) {
                el.value = value;
                updateSliderFill(el);
            }
            if (valEl) valEl.textContent = slider.format(value);
        });
    }
    updateModelWithSliders();
}

// Update model with slider values
function updateModelWithSliders() {
    try {
        for (let year = 2026; year <= 2030; year++) {
            const revGrowthEl = document.getElementById(`revGrowth${year}`);
            const peRatioEl = document.getElementById(`peRatio${year}`);
            const netMarginEl = document.getElementById(`netMargin${year}`);
            const salesMktEl = document.getElementById(`salesMkt${year}`);
            const memberGrowthEl = document.getElementById(`memberGrowth${year}`);
            
            if (!revGrowthEl || !peRatioEl || !netMarginEl || !salesMktEl || !memberGrowthEl) continue;
            
            const revenueGrowth = parseFloat(revGrowthEl.value);
            const peRatio = parseFloat(peRatioEl.value);
            const netIncomeMargin = parseFloat(netMarginEl.value);
            const salesMarketingPercent = parseFloat(salesMktEl.value);
            const memberGrowthRate = parseFloat(memberGrowthEl.value);
            
            MODEL_ASSUMPTIONS[`revenueGrowth${year}`] = revenueGrowth;
            MODEL_ASSUMPTIONS[`peRatio${year}`] = peRatio;
            
            const prevYear = year === 2026 ? GUIDANCE_DATA[2025] : PROJECTION_DATA[year - 1];
            const prevRevenue = prevYear.revenue;
            const prevClientCount = prevYear.clientCount;
            
            const revenue = prevRevenue * (1 + revenueGrowth / 100);
            const netIncome = revenue * (netIncomeMargin / 100);
            const salesMarketing = revenue * (salesMarketingPercent / 100);
            const sharesOutstanding = year === 2030 ? MODEL_ASSUMPTIONS.sharesOutstanding2030 : BASE_DATA.sharesOutstanding;
            const eps = netIncome / 1000000 / sharesOutstanding;
            
            const clientCount = prevClientCount * (1 + memberGrowthRate / 100);
            const newMemberAdds = clientCount - prevClientCount;
            const costPerMember = newMemberAdds > 0 ? (salesMarketing * 1000) / newMemberAdds : null;
            
            PROJECTION_DATA[year].revenue = revenue;
            PROJECTION_DATA[year].netIncome = netIncome;
            PROJECTION_DATA[year].eps = eps;
            PROJECTION_DATA[year].salesMarketing = salesMarketing;
            PROJECTION_DATA[year].salesMarketingPercent = salesMarketingPercent;
            PROJECTION_DATA[year].costPerMember = costPerMember;
            PROJECTION_DATA[year].newMemberAdds = newMemberAdds;
            PROJECTION_DATA[year].clientCount = clientCount;
            PROJECTION_DATA[year].memberGrowthRate = memberGrowthRate;
        }
        
        const projections = calculateProjections();
        updateAllChartsWithData(projections);
    } catch(e) {
        console.error('Error in updateModelWithSliders:', e);
    }
}

// Calculate projections
function calculateProjections() {
    const projections = [];
    
    // Historical years (2020-2024)
    for (let year = 2020; year <= 2024; year++) {
        const data = HISTORICAL_DATA[year];
        projections.push({
            year: year,
            revenue: data.revenue,
            revenueGrowth: year === 2020 ? null : ((data.revenue - HISTORICAL_DATA[year - 1].revenue) / HISTORICAL_DATA[year - 1].revenue * 100),
            netIncome: data.netIncome,
            eps: data.eps,
            salesMarketing: data.salesMarketing,
            salesMarketingPercent: data.salesMarketingPercent,
            costPerMember: data.costPerMember,
            newMemberAdds: data.newMemberAdds,
            clientCount: data.clientCount,
            memberGrowthRate: data.memberGrowthRate,
            period: 'historical'
        });
    }
    
    // 2025 year (now past performance)
    const data2025 = GUIDANCE_DATA[2025];
    const revenue2024 = HISTORICAL_DATA[2024].revenue;
    projections.push({
        year: 2025,
        revenue: data2025.revenue,
        revenueGrowth: ((data2025.revenue - revenue2024) / revenue2024) * 100,
        netIncome: data2025.netIncome,
        eps: data2025.eps,
        salesMarketing: data2025.salesMarketing,
        salesMarketingPercent: data2025.salesMarketingPercent,
        costPerMember: data2025.costPerMember,
        newMemberAdds: data2025.newMemberAdds,
        clientCount: data2025.clientCount,
        memberGrowthRate: data2025.memberGrowthRate,
        period: 'historical'
    });
    
    // Projection years (2026-2030)
    for (let year = 2026; year <= 2030; year++) {
        const projection = PROJECTION_DATA[year];
        const prevRevenue = year === 2026 ? GUIDANCE_DATA[2025].revenue : PROJECTION_DATA[year - 1].revenue;
        
        projections.push({
            year: year,
            revenue: projection.revenue,
            revenueGrowth: ((projection.revenue - prevRevenue) / prevRevenue) * 100,
            netIncome: projection.netIncome,
            eps: projection.eps,
            salesMarketing: projection.salesMarketing,
            salesMarketingPercent: projection.salesMarketingPercent,
            costPerMember: projection.costPerMember,
            newMemberAdds: projection.newMemberAdds,
            clientCount: projection.clientCount,
            memberGrowthRate: projection.memberGrowthRate,
            period: 'projection'
        });
    }
    
    return projections;
}

// Calculate P/E valuation
function calculatePEValuation(projections) {
    const finalYear = projections[projections.length - 1];
    if (!finalYear.netIncome || finalYear.netIncome <= 0) {
        return { price: 0, marketCap: 0 };
    }
    
    const netIncomeBillions = finalYear.netIncome / 1000000;
    const eps = netIncomeBillions / MODEL_ASSUMPTIONS.sharesOutstanding2030;
    const peRatio = MODEL_ASSUMPTIONS.peRatio2030;
    const price = eps * peRatio;
    const marketCap = price * MODEL_ASSUMPTIONS.sharesOutstanding2030;
    
    return { price, marketCap };
}

// Calculate market cap trends
function calculateMarketCapTrends(projections) {
    const trends = { years: [], marketCaps: [] };
    
    projections.forEach(proj => {
        if (proj.netIncome && proj.netIncome > 0) {
            trends.years.push(proj.year);
            const netIncomeBillions = proj.netIncome / 1000000;
            const sharesOutstanding = proj.year === 2030 ? MODEL_ASSUMPTIONS.sharesOutstanding2030 : BASE_DATA.sharesOutstanding;
            const peRatio = MODEL_ASSUMPTIONS[`peRatio${proj.year}`] || MODEL_ASSUMPTIONS.peRatio2030;
            const eps = netIncomeBillions / sharesOutstanding;
            const price = eps * peRatio;
            trends.marketCaps.push(price * sharesOutstanding);
        }
    });
    
    return trends;
}

// Calculate scenario trends
function calculateScenarioTrends(projections) {
    const trends = { years: [], prices: [] };
    
    projections.forEach(proj => {
        trends.years.push(proj.year);
        if (!proj.netIncome || proj.netIncome <= 0) {
            trends.prices.push(BASE_DATA.currentPrice);
        } else {
            const netIncomeBillions = proj.netIncome / 1000000;
            const sharesOutstanding = proj.year === 2030 ? MODEL_ASSUMPTIONS.sharesOutstanding2030 : BASE_DATA.sharesOutstanding;
            const peRatio = MODEL_ASSUMPTIONS[`peRatio${proj.year}`] || MODEL_ASSUMPTIONS.peRatio2025;
            trends.prices.push((netIncomeBillions / sharesOutstanding) * peRatio);
        }
    });
    
    return trends;
}

// Update projections table (transposed: metrics as rows, years as columns)
function updateProjectionsTable(projections) {
    const tbody = document.getElementById('projectionsBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // Define metrics to display
    const metrics = [
        { name: 'Sales & Marketing', key: 'salesMarketing', format: v => formatCurrency(v) },
        { name: 'Member Growth %', key: 'memberGrowthRate', format: v => v ? `${v.toFixed(2)}%` : 'NA' },
        { name: 'New Member Adds', key: 'newMemberAdds', format: v => v ? formatNumber(v) : 'NA' },
        { name: 'Total Members', key: 'clientCount', format: v => formatNumber(v) },
        { name: 'Cost Per Member', key: 'costPerMember', format: v => v ? `$${v.toFixed(0)}` : 'NA' },
        { name: 'Revenue', key: 'revenue', format: v => v ? `$${(v / 1000000).toFixed(2)}B` : 'N/A' },
        { name: 'Revenue Growth %', key: 'revenueGrowth', format: v => v ? `${v.toFixed(0)}%` : 'NA' },
        { name: 'S&M (% of Revenue)', key: 'salesMarketingPercent', format: v => v ? `${v}%` : 'N/A' },
        { name: 'Net Income', key: 'netIncome', format: v => v ? `$${(v / 1000000).toFixed(2)}B` : 'N/A' },
        { name: 'Net Income %', key: 'netIncomeMargin', format: v => v ? `${v.toFixed(1)}%` : 'N/A' },
        { name: 'EPS', key: 'eps', format: v => v ? `$${v.toFixed(2)}` : 'N/A' },
        { name: 'FWD P/E Ratio', key: 'peRatio', format: v => v ? `${v}x` : 'N/A' }
    ];
    
    // Calculate net income margin and P/E ratio for each projection
    projections.forEach(proj => {
        proj.netIncomeMargin = proj.netIncome && proj.revenue ? (proj.netIncome / proj.revenue) * 100 : null;
        // P/E ratios: historical years and 2025 N/A, 2026+ use model assumptions
        if (proj.year >= 2026 && proj.year <= 2030) {
            proj.peRatio = MODEL_ASSUMPTIONS[`peRatio${proj.year}`] || null;
        } else {
            proj.peRatio = null; // Historical years and 2025 - no P/E shown
        }
    });
    
    // Create a row for each metric
    metrics.forEach(metric => {
        const row = document.createElement('tr');
        
        // Metric name cell (first column)
        const metricCell = document.createElement('td');
        metricCell.innerHTML = `<strong>${metric.name}</strong>`;
        metricCell.className = 'metric-cell';
        row.appendChild(metricCell);
        
        // Data cells for each year
        projections.forEach(proj => {
            const cell = document.createElement('td');
            cell.className = proj.period === 'historical' ? 'past-performance' : 'projection';
            cell.textContent = metric.format(proj[metric.key]);
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
}

// Update segment revenue table - synchronized with main projections
function updateSegmentRevenueTable() {
    const tbody = document.getElementById('segmentRevenueBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
    
    // Get actual total revenue from projections (in millions)
    const projections = calculateProjections();
    const totalRevenueByYear = {};
    projections.forEach(proj => {
        totalRevenueByYear[proj.year] = proj.revenue / 1000000; // Convert to billions
    });
    
    // Base segment percentages (based on 2024 actuals)
    // 2024: Lending 65.5%, FS 23%, Tech 11.5%
    const segmentMix = {
        2024: { lending: 0.655, fs: 0.230, tech: 0.115 },
        2025: { lending: 0.610, fs: 0.300, tech: 0.090 },
        2026: { lending: 0.580, fs: 0.330, tech: 0.090 },
        2027: { lending: 0.540, fs: 0.370, tech: 0.090 },
        2028: { lending: 0.500, fs: 0.400, tech: 0.100 },
        2029: { lending: 0.460, fs: 0.430, tech: 0.110 },
        2030: { lending: 0.400, fs: 0.480, tech: 0.120 }
    };
    
    // Calculate segment revenues based on total revenue and mix
    const segmentRevenues = {
        lending: {},
        fs: {},
        tech: {}
    };
    
    years.forEach(year => {
        const total = totalRevenueByYear[year] || 0;
        const mix = segmentMix[year];
        segmentRevenues.lending[year] = total * mix.lending;
        segmentRevenues.fs[year] = total * mix.fs;
        segmentRevenues.tech[year] = total * mix.tech;
    });
    
    // Segment definitions
    const segments = [
        { name: 'Lending Revenue', key: 'lending', color: '#00A5E5' },
        { name: 'Financial Services Revenue', key: 'fs', color: '#4CAF50' },
        { name: 'Technology Platform Revenue', key: 'tech', color: '#9C27B0' }
    ];
    
    // Create rows for each segment
    segments.forEach(segment => {
        const row = document.createElement('tr');
        
        // Segment name cell
        const nameCell = document.createElement('td');
        nameCell.innerHTML = `<strong style="border-left: 3px solid ${segment.color}; padding-left: 8px;">${segment.name}</strong>`;
        nameCell.className = 'metric-cell';
        row.appendChild(nameCell);
        
        // Data cells for each year
        years.forEach((year, index) => {
            const cell = document.createElement('td');
            cell.className = year === 2024 ? 'past-performance' : 
                            year === 2025 ? 'company-guidance' : 'projection';
            
            const value = segmentRevenues[segment.key][year];
            let cellContent = `$${value.toFixed(2)}B`;
            
            // Add YoY growth for years after 2024
            if (index > 0) {
                const prevYear = years[index - 1];
                const prevValue = segmentRevenues[segment.key][prevYear];
                if (prevValue > 0) {
                    const yoyGrowth = ((value - prevValue) / prevValue) * 100;
                    cellContent += `<br><span style="font-size: 10px; color: #2ecc71;">+${yoyGrowth.toFixed(0)}%</span>`;
                }
            }
            
            cell.innerHTML = cellContent;
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
    
    // Add total row (matches main projections table exactly)
    const totalRow = document.createElement('tr');
    totalRow.style.backgroundColor = '#f0f8ff';
    totalRow.style.fontWeight = 'bold';
    
    const totalNameCell = document.createElement('td');
    totalNameCell.innerHTML = '<strong>Total Revenue</strong>';
    totalNameCell.className = 'metric-cell';
    totalRow.appendChild(totalNameCell);
    
    years.forEach((year, index) => {
        const cell = document.createElement('td');
        cell.className = year === 2024 ? 'past-performance' : 
                        year === 2025 ? 'company-guidance' : 'projection';
        cell.style.color = '#00A5E5';
        
        const total = totalRevenueByYear[year] || 0;
        let cellContent = `$${total.toFixed(2)}B`;
        
        // Add YoY growth for years after 2024
        if (index > 0) {
            const prevYear = years[index - 1];
            const prevTotal = totalRevenueByYear[prevYear] || 0;
            if (prevTotal > 0) {
                const yoyGrowth = ((total - prevTotal) / prevTotal) * 100;
                cellContent += `<br><span style="font-size: 10px; color: #00A5E5;">+${yoyGrowth.toFixed(0)}%</span>`;
            }
        }
        
        cell.innerHTML = cellContent;
        totalRow.appendChild(cell);
    });
    
    tbody.appendChild(totalRow);
}

// Format currency
function formatCurrency(value) {
    if (!value) return 'N/A';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}B`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}M`;
    return `$${value.toFixed(0)}`;
}

// Format number
function formatNumber(value) {
    if (!value) return 'N/A';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toFixed(0);
}

// Update assumptions display
function updateAssumptions() {
    const content = document.getElementById('assumptionsContent');
    if (!content) return;
    
    const revenue2025 = (GUIDANCE_DATA[2025].revenue / 1000000).toFixed(2);
    const netMargin2025 = ((GUIDANCE_DATA[2025].netIncome / GUIDANCE_DATA[2025].revenue) * 100).toFixed(1);
    const netMargin2030 = ((PROJECTION_DATA[2030].netIncome / PROJECTION_DATA[2030].revenue) * 100).toFixed(1);
    
    content.innerHTML = `
        <ul class="assumptions-list">
            <li><strong>FWD P/E Ratios:</strong> 2026: ${MODEL_ASSUMPTIONS.peRatio2026}x | 2027: ${MODEL_ASSUMPTIONS.peRatio2027}x | 2028: ${MODEL_ASSUMPTIONS.peRatio2028}x | 2029: ${MODEL_ASSUMPTIONS.peRatio2029}x | 2030: ${MODEL_ASSUMPTIONS.peRatio2030}x</li>
            <li><strong>Revenue Growth:</strong> 2026: ${MODEL_ASSUMPTIONS.revenueGrowth2026}% | 2027: ${MODEL_ASSUMPTIONS.revenueGrowth2027}% | 2028: ${MODEL_ASSUMPTIONS.revenueGrowth2028}% | 2029: ${MODEL_ASSUMPTIONS.revenueGrowth2029}% | 2030: ${MODEL_ASSUMPTIONS.revenueGrowth2030}%</li>
            <li><strong>Net Income Margins:</strong> Improving from ${netMargin2025}% (2025) to ${netMargin2030}% (2030)</li>
            <li><strong>Sales & Marketing:</strong> 2026: ${PROJECTION_DATA[2026].salesMarketingPercent}% | 2027: ${PROJECTION_DATA[2027].salesMarketingPercent}% | 2028: ${PROJECTION_DATA[2028].salesMarketingPercent}% | 2029: ${PROJECTION_DATA[2029].salesMarketingPercent}% | 2030: ${PROJECTION_DATA[2030].salesMarketingPercent}%</li>
            <li><strong>Catalysts:</strong> Loan platform deals, crypto services, Galileo SAAS, lending expansion, Invest, international transfers</li>
        </ul>
    `;
}

// Update upside percentage based on current price
function updateUpsidePercentage(projectedPrice) {
    if (!projectedPrice) {
        const el = document.getElementById('projectedPrice');
        if (el) projectedPrice = parseFloat(el.textContent.replace('$', ''));
    }
    if (!projectedPrice) return;
    
    const currentPrice = BASE_DATA.currentPrice || 20.86;
    const upside = ((projectedPrice - currentPrice) / currentPrice) * 100;
    const upsideElement = document.getElementById('priceUpside');
    if (upsideElement) {
        upsideElement.textContent = `+${Math.round(upside)}%`;
    }
}

// Update stock price
async function updateCurrentStockPrice() {
    const priceElement = document.getElementById('currentStockPrice');
    const changeElement = document.getElementById('priceChange');
    
    if (changeElement) changeElement.textContent = '';
    if (BASE_DATA.currentPrice && priceElement) {
        priceElement.textContent = `$${BASE_DATA.currentPrice.toFixed(2)}`;
    }
    
    // Try multiple proxies/APIs for reliability
    const proxies = [
        { url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/SOFI?interval=1d&range=1d'), type: 'yahoo' },
        { url: 'https://corsproxy.io/?' + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/SOFI?interval=1d&range=1d'), type: 'yahoo' },
        { url: 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/SOFI?interval=1d&range=1d'), type: 'yahoo' }
    ];
    
    let fetched = false;
    
    for (const proxy of proxies) {
        if (fetched) break;
        try {
            const response = await fetch(proxy.url, { signal: AbortSignal.timeout(5000) });
            
            if (response.ok) {
                const data = await response.json();
                if (data.chart?.result?.[0]) {
                    const meta = data.chart.result[0].meta;
                    const price = meta.regularMarketPrice || meta.previousClose;
                    const previousClose = meta.previousClose;
                    
                    if (price && priceElement) {
                        priceElement.textContent = `$${price.toFixed(2)}`;
                        BASE_DATA.currentPrice = price;
                        fetched = true;
                        updateUpsidePercentage(); // Recalculate upside with live price
                        
                        if (previousClose && price !== previousClose && changeElement) {
                            const change = price - previousClose;
                            const changePercent = ((change / previousClose) * 100).toFixed(2);
                            const color = change >= 0 ? '#4caf50' : '#e53935';
                            const symbol = change >= 0 ? '+' : '';
                            changeElement.innerHTML = `<span style="color: ${color}">${symbol}${change.toFixed(2)} (${symbol}${changePercent}%)</span>`;
                        }
                    }
                }
            }
        } catch (error) {
            console.log(`Proxy failed: ${proxy.url.substring(0, 40)}..., trying next`);
        }
    }
    
    if (!fetched) {
        console.log('All stock price fetches failed, using fallback');
    }
    
    setTimeout(updateCurrentStockPrice, 60000);
}

// Chart colors
const COLORS = {
    cyan: '#00a5e5',
    green: '#4caf50',
    purple: '#9c27b0'
};

// Initialize charts
function initializeCharts() {
    // Register datalabels plugin
    if (typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
    }
    
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { display: true, position: 'top', align: 'center', labels: { color: '#333', boxWidth: 12, padding: 8, font: { size: 10 } } },
            datalabels: {
                display: true,
                color: '#333',
                anchor: 'end',
                align: 'top',
                font: { size: 11, weight: 'bold' }
            }
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#666' } },
            x: { grid: { display: false }, ticks: { color: '#666' } }
        }
    };
    
    // Revenue Growth Chart
    const revenueGrowthCtx = document.getElementById('revenueGrowthChart');
    if (revenueGrowthCtx) {
        revenueGrowthChart = new Chart(revenueGrowthCtx.getContext('2d'), {
            type: 'bar',
            data: { labels: [], datasets: [{ label: 'Revenue Growth %', data: [], backgroundColor: COLORS.cyan, borderRadius: 4 }] },
            options: { ...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, min: 0, max: 100 } }, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, formatter: v => v ? v.toFixed(1) + '%' : '' } } }
        });
    }
    
    // Stock Price Chart
    const scenarioCtx = document.getElementById('scenarioChart');
    if (scenarioCtx) {
        scenarioChart = new Chart(scenarioCtx.getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Stock Price', data: [], borderColor: COLORS.cyan, backgroundColor: 'rgba(0,165,229,0.1)', fill: true, tension: 0.4 }] },
            options: { ...commonOptions, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, formatter: v => '$' + Math.round(v) } } }
        });
    }
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        revenueChart = new Chart(revenueCtx.getContext('2d'), {
            type: 'bar',
            data: { labels: [], datasets: [{ label: 'Revenue ($B)', data: [], backgroundColor: COLORS.cyan, borderRadius: 4 }] },
            options: { ...commonOptions, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, formatter: v => v ? '$' + v.toFixed(1) + 'B' : '' } } }
        });
    }
    
    // Market Cap Chart
    const marketCapCtx = document.getElementById('marketCapChart');
    if (marketCapCtx) {
        marketCapChart = new Chart(marketCapCtx.getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Market Cap ($B)', data: [], borderColor: COLORS.cyan, backgroundColor: 'rgba(0,165,229,0.1)', fill: true, tension: 0.4 }] },
            options: { ...commonOptions, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, formatter: v => Math.round(v) + 'B' } } }
        });
    }
    
    // Member Growth % Chart
    const memberGrowthCtx = document.getElementById('memberGrowthChart');
    if (memberGrowthCtx) {
        memberGrowthChart = new Chart(memberGrowthCtx.getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Member Growth %', data: [], borderColor: COLORS.green, backgroundColor: 'rgba(76,175,80,0.1)', fill: true, tension: 0.4 }] },
            options: { ...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, min: 0, max: 100 } }, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, formatter: v => v ? v.toFixed(1) + '%' : '' } } }
        });
    }
    
    // Member Chart
    const memberCtx = document.getElementById('memberChart');
    if (memberCtx) {
        memberChart = new Chart(memberCtx.getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Members (M)', data: [], borderColor: COLORS.cyan, backgroundColor: 'rgba(0,165,229,0.1)', fill: true, tension: 0.4 }] },
            options: { ...commonOptions, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, formatter: v => v ? v.toFixed(1) + 'M' : '' } } }
        });
    }
    
    // Sales & Marketing Spend Chart ($B)
    const salesMarketingCtx = document.getElementById('salesMarketingChart');
    if (salesMarketingCtx) {
        salesMarketingChart = new Chart(salesMarketingCtx.getContext('2d'), {
            type: 'bar',
            data: { labels: [], datasets: [{ label: 'S&M ($B)', data: [], backgroundColor: COLORS.cyan, borderRadius: 4 }] },
            options: { ...commonOptions, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, formatter: v => v ? v.toFixed(1) + 'B' : '' } } }
        });
    }
    
    // Sales & Marketing % of Revenue Chart
    const salesMarketingPercentCtx = document.getElementById('salesMarketingPercentChart');
    if (salesMarketingPercentCtx) {
        salesMarketingPercentChart = new Chart(salesMarketingPercentCtx.getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'S&M % of Revenue', data: [], borderColor: COLORS.purple, backgroundColor: 'rgba(156,39,176,0.1)', fill: true, tension: 0.4 }] },
            options: { ...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, min: 0, max: 60 } }, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, formatter: v => v ? Math.round(v) + '%' : '' } } }
        });
    }
    
    // Member Acquisition Cost Chart
    const memberAcquisitionCtx = document.getElementById('memberAcquisitionChart');
    if (memberAcquisitionCtx) {
        memberAcquisitionChart = new Chart(memberAcquisitionCtx.getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Cost per Member ($)', data: [], borderColor: COLORS.purple, backgroundColor: 'rgba(156,39,176,0.1)', fill: true, tension: 0.4 }] },
            options: { ...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, min: 0, max: 360 } }, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, formatter: v => v ? '$' + Math.round(v) : '' } } }
        });
    }
    
    // Net Income Margin Chart
    const netIncomeMarginCtx = document.getElementById('netIncomeMarginChart');
    if (netIncomeMarginCtx) {
        netIncomeMarginChart = new Chart(netIncomeMarginCtx.getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Net Margin %', data: [], borderColor: COLORS.green, backgroundColor: 'rgba(76,175,80,0.1)', fill: true, tension: 0.4 }] },
            options: { ...commonOptions, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, formatter: v => v ? v.toFixed(1) + '%' : '' } } }
        });
    }
    
    // Net Income Chart
    const profitabilityCtx = document.getElementById('profitabilityChart');
    if (profitabilityCtx) {
        profitabilityChart = new Chart(profitabilityCtx.getContext('2d'), {
            type: 'bar',
            data: { labels: [], datasets: [{ label: 'Net Income ($B)', data: [], backgroundColor: COLORS.green, borderRadius: 4 }] },
            options: { ...commonOptions, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, formatter: v => v ? '$' + v.toFixed(1) + 'B' : '' } } }
        });
    }
    
    // P/E Ratio Chart
    const peRatioCtx = document.getElementById('peRatioChart');
    if (peRatioCtx) {
        peRatioChart = new Chart(peRatioCtx.getContext('2d'), {
            type: 'bar',
            data: { labels: [], datasets: [{ label: 'FWD P/E Ratio', data: [], backgroundColor: COLORS.purple, borderRadius: 4 }] },
            options: { ...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, max: 60 } }, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, formatter: v => v ? v + 'x' : '' } } }
        });
    }
    
    // EPS Chart
    const epsCtx = document.getElementById('epsChart');
    if (epsCtx) {
        epsChart = new Chart(epsCtx.getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'EPS ($)', data: [], borderColor: COLORS.cyan, backgroundColor: 'rgba(0,165,229,0.1)', fill: true, tension: 0.4 }] },
            options: { ...commonOptions, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, formatter: v => v ? '$' + v.toFixed(2) : '' } } }
        });
    }
}

// ============================================
// SEGMENT REVENUE PROJECTIONS
// ============================================

// Segment Data - Baseline 2024 ($Billions)
const SEGMENT_DATA = {
    lending: {
        2024: 1.71,
        2025: { revenue: 2.24, growth: 31 },
        2026: { revenue: 2.87, growth: 28 },
        2027: { revenue: 3.59, growth: 25 },
        2028: { revenue: 4.38, growth: 22 },
        2029: { revenue: 5.17, growth: 18 },
        2030: { revenue: 5.89, growth: 14 }
    },
    financialServices: {
        2024: 0.60,
        2025: { revenue: 1.13, growth: 89 },
        2026: { revenue: 1.92, growth: 70 },
        2027: { revenue: 3.07, growth: 60 },
        2028: { revenue: 4.61, growth: 50 },
        2029: { revenue: 6.45, growth: 40 },
        2030: { revenue: 7.79, growth: 21 }
    },
    techPlatform: {
        2024: 0.30,
        2025: { revenue: 0.35, growth: 17 },
        2026: { revenue: 0.42, growth: 20 },
        2027: { revenue: 0.50, growth: 20 },
        2028: { revenue: 0.60, growth: 20 },
        2029: { revenue: 0.80, growth: 33 },
        2030: { revenue: 1.38, growth: 72 }
    }
};

// Segment Chart Instances
let segmentStackedChart, lendingRevenueChart, fsRevenueChart, techRevenueChart;

// Initialize Segment Charts - Cyan area-fill style matching Stock Price/Market Cap charts
function initializeSegmentCharts() {
    Chart.register(ChartDataLabels);
    
    const years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
    
    // Cyan theme matching main charts (Stock Price, Market Cap style)
    const cyanColor = '#00A5E5';
    const cyanFill = 'rgba(0, 165, 229, 0.15)';
    
    // Stacked Bar Chart - Total Revenue by Business Segment with data labels (starts from 2026)
    const stackedYears = ['2026', '2027', '2028', '2029', '2030'];
    const stackedCtx = document.getElementById('segmentStackedChart');
    if (stackedCtx) {
        segmentStackedChart = new Chart(stackedCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: stackedYears,
                datasets: [
                    { label: 'Lending', data: [], backgroundColor: 'rgba(0, 165, 229, 0.8)', borderColor: '#00A5E5', borderWidth: 1 },
                    { label: 'Financial Services', data: [], backgroundColor: 'rgba(76, 175, 80, 0.8)', borderColor: '#4CAF50', borderWidth: 1 },
                    { label: 'Technology Platform', data: [], backgroundColor: 'rgba(156, 39, 176, 0.8)', borderColor: '#9C27B0', borderWidth: 1 }
                ]
            },
            options: {
                responsive: true,
                plugins: { 
                    title: {
                        display: true,
                        text: 'Total Revenue by Segment',
                        position: 'top',
                        align: 'start',
                        font: { size: 13, weight: 'bold' },
                        color: '#333',
                        padding: { top: 5, bottom: 5 }
                    },
                    legend: { 
                        position: 'top', 
                        align: 'end', 
                        labels: { 
                            color: '#333', 
                            boxWidth: 12, 
                            padding: 10, 
                            font: { size: 11, weight: '500' },
                            usePointStyle: false
                        }
                    }, 
                    datalabels: { 
                        display: true,
                        color: '#000',
                        font: { weight: 'bold', size: 9 },
                        anchor: 'center',
                        align: 'center',
                        formatter: v => v > 0.5 ? '$' + v.toFixed(1) + 'B' : ''
                    }
                },
                scales: {
                    x: { stacked: true, ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.05)' } },
                    y: { stacked: true, min: 0, max: 17, ticks: { color: '#666', callback: v => '$' + v + 'B' }, grid: { color: 'rgba(0,0,0,0.05)' } }
                }
            }
        });
    }
    
    // Years starting from 2026 for segment charts
    const segmentYears = ['2026', '2027', '2028', '2029', '2030'];
    
    // Lending Revenue Chart - Cyan area fill style (starts from 2026)
    const lendingCtx = document.getElementById('lendingRevenueChart');
    if (lendingCtx) {
        lendingRevenueChart = new Chart(lendingCtx.getContext('2d'), {
            type: 'line',
            data: { 
                labels: segmentYears, 
                datasets: [{ 
                    label: 'Lending ($B)', 
                    data: [], 
                    borderColor: cyanColor, 
                    backgroundColor: cyanFill, 
                    fill: true, 
                    tension: 0.3, 
                    borderWidth: 2, 
                    pointRadius: 4, 
                    pointBackgroundColor: cyanColor,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1
                }] 
            },
            options: {
                responsive: true,
                plugins: { 
                    legend: { display: true, position: 'top', labels: { color: '#333', boxWidth: 12 } }, 
                    datalabels: { 
                        anchor: 'end', 
                        align: 'top', 
                        offset: 2,
                        color: '#333', 
                        font: { weight: 'bold', size: 10 }, 
                        formatter: v => '$' + v.toFixed(2) + 'B'
                    } 
                },
                scales: { 
                    y: { min: 0, max: 8, ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.05)' } }, 
                    x: { ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.05)' } } 
                }
            }
        });
    }
    
    // Financial Services Revenue Chart - Cyan area fill style (starts from 2026)
    const fsCtx = document.getElementById('fsRevenueChart');
    if (fsCtx) {
        fsRevenueChart = new Chart(fsCtx.getContext('2d'), {
            type: 'line',
            data: { 
                labels: segmentYears, 
                datasets: [{ 
                    label: 'Financial Services ($B)', 
                    data: [], 
                    borderColor: cyanColor, 
                    backgroundColor: cyanFill, 
                    fill: true, 
                    tension: 0.3, 
                    borderWidth: 2, 
                    pointRadius: 4, 
                    pointBackgroundColor: cyanColor,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1
                }] 
            },
            options: {
                responsive: true,
                plugins: { 
                    legend: { display: true, position: 'top', labels: { color: '#333', boxWidth: 12 } }, 
                    datalabels: { 
                        anchor: 'end', 
                        align: 'top', 
                        offset: 2,
                        color: '#333', 
                        font: { weight: 'bold', size: 10 }, 
                        formatter: v => '$' + v.toFixed(2) + 'B'
                    } 
                },
                scales: { 
                    y: { min: 0, max: 10, ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.05)' } }, 
                    x: { ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.05)' } } 
                }
            }
        });
    }
    
    // Tech Platform Revenue Chart - Cyan area fill style (starts from 2026)
    const techYears = ['2026', '2027', '2028', '2029', '2030'];
    const techCtx = document.getElementById('techRevenueChart');
    if (techCtx) {
        techRevenueChart = new Chart(techCtx.getContext('2d'), {
            type: 'line',
            data: { 
                labels: techYears, 
                datasets: [{ 
                    label: 'Tech Platform ($B)', 
                    data: [], 
                    borderColor: cyanColor, 
                    backgroundColor: cyanFill, 
                    fill: true, 
                    tension: 0.3, 
                    borderWidth: 2, 
                    pointRadius: 4, 
                    pointBackgroundColor: cyanColor,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1
                }] 
            },
            options: {
                responsive: true,
                plugins: { 
                    legend: { display: true, position: 'top', labels: { color: '#333', boxWidth: 12 } }, 
                    datalabels: { 
                        anchor: 'end', 
                        align: 'top', 
                        offset: 2,
                        color: '#333', 
                        font: { weight: 'bold', size: 10 }, 
                        formatter: v => '$' + v.toFixed(2) + 'B'
                    } 
                },
                scales: { 
                    y: { min: 0, max: 2, ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.05)' } }, 
                    x: { ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.05)' } } 
                }
            }
        });
    }
}

// Calculate segment projections based on slider values
function calculateSegmentProjections() {
    const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
    const lending = [SEGMENT_DATA.lending[2024]];
    const fs = [SEGMENT_DATA.financialServices[2024]];
    const tech = [SEGMENT_DATA.techPlatform[2024]];
    
    // 2025 uses fixed growth rates
    lending.push(SEGMENT_DATA.lending[2025].revenue);
    fs.push(SEGMENT_DATA.financialServices[2025].revenue);
    tech.push(SEGMENT_DATA.techPlatform[2025].revenue);
    
    // 2026-2030 use slider values
    for (let year = 2026; year <= 2030; year++) {
        const lendingGrowthEl = document.getElementById('lendingGrowth' + year);
        const fsGrowthEl = document.getElementById('fsGrowth' + year);
        const techGrowthEl = document.getElementById('techGrowth' + year);
        
        const lendingGrowth = lendingGrowthEl ? parseFloat(lendingGrowthEl.value) : SEGMENT_DATA.lending[year].growth;
        const fsGrowth = fsGrowthEl ? parseFloat(fsGrowthEl.value) : SEGMENT_DATA.financialServices[year].growth;
        const techGrowth = techGrowthEl ? parseFloat(techGrowthEl.value) : SEGMENT_DATA.techPlatform[year].growth;
        
        const prevLending = lending[lending.length - 1];
        const prevFs = fs[fs.length - 1];
        const prevTech = tech[tech.length - 1];
        
        lending.push(prevLending * (1 + lendingGrowth / 100));
        fs.push(prevFs * (1 + fsGrowth / 100));
        tech.push(prevTech * (1 + techGrowth / 100));
    }
    
    return { years, lending, fs, tech };
}

// Update all segment charts
function updateSegmentCharts() {
    const data = calculateSegmentProjections();
    const years = data.years.map(y => y.toString());
    
    if (segmentStackedChart) {
        // Stacked chart starts from 2026 (index 2 onwards)
        segmentStackedChart.data.labels = years.slice(2);
        segmentStackedChart.data.datasets[0].data = data.lending.slice(2);
        segmentStackedChart.data.datasets[1].data = data.fs.slice(2);
        segmentStackedChart.data.datasets[2].data = data.tech.slice(2);
        segmentStackedChart.update();
    }
    
    if (lendingRevenueChart) {
        // Lending chart starts from 2026 (index 2 onwards)
        lendingRevenueChart.data.labels = years.slice(2);
        lendingRevenueChart.data.datasets[0].data = data.lending.slice(2);
        lendingRevenueChart.update();
    }
    
    if (fsRevenueChart) {
        // FS chart starts from 2026 (index 2 onwards)
        fsRevenueChart.data.labels = years.slice(2);
        fsRevenueChart.data.datasets[0].data = data.fs.slice(2);
        fsRevenueChart.update();
    }
    
    if (techRevenueChart) {
        // Tech chart starts from 2026 (index 2 onwards)
        techRevenueChart.data.labels = years.slice(2);
        techRevenueChart.data.datasets[0].data = data.tech.slice(2);
        techRevenueChart.update();
    }
    
    // Update tables
    updateSegmentTables(data);
}

// Update segment tables
function updateSegmentTables(data) {
    const revenueBody = document.getElementById('segmentTableBody');
    const growthBody = document.getElementById('segmentGrowthTableBody');
    
    if (revenueBody) {
        revenueBody.innerHTML = `
            <tr class="segment-lending">
                <td><strong>Lending</strong></td>
                ${data.lending.map((v, i) => `<td>$${v.toFixed(2)}B${i > 0 ? '<br><span class="growth-rate">+' + Math.round((v / data.lending[i-1] - 1) * 100) + '%</span>' : ''}</td>`).join('')}
            </tr>
            <tr class="segment-fs">
                <td><strong>Financial Services</strong></td>
                ${data.fs.map((v, i) => `<td>$${v.toFixed(2)}B${i > 0 ? '<br><span class="growth-rate">+' + Math.round((v / data.fs[i-1] - 1) * 100) + '%</span>' : ''}</td>`).join('')}
            </tr>
            <tr class="segment-tech">
                <td><strong>Technology Platform</strong></td>
                ${data.tech.map((v, i) => `<td>$${v.toFixed(2)}B${i > 0 ? '<br><span class="growth-rate">+' + Math.round((v / data.tech[i-1] - 1) * 100) + '%</span>' : ''}</td>`).join('')}
            </tr>
            <tr class="total-row">
                <td><strong>TOTAL</strong></td>
                ${data.years.map((y, i) => `<td>$${(data.lending[i] + data.fs[i] + data.tech[i]).toFixed(2)}B</td>`).join('')}
            </tr>
        `;
    }
    
    if (growthBody) {
        const lendingGrowths = data.lending.slice(1).map((v, i) => Math.round((v / data.lending[i] - 1) * 100));
        const fsGrowths = data.fs.slice(1).map((v, i) => Math.round((v / data.fs[i] - 1) * 100));
        const techGrowths = data.tech.slice(1).map((v, i) => Math.round((v / data.tech[i] - 1) * 100));
        
        const lendingCAGR = Math.round((Math.pow(data.lending[6] / data.lending[0], 1/6) - 1) * 100);
        const fsCAGR = Math.round((Math.pow(data.fs[6] / data.fs[0], 1/6) - 1) * 100);
        const techCAGR = Math.round((Math.pow(data.tech[6] / data.tech[0], 1/6) - 1) * 100);
        
        growthBody.innerHTML = `
            <tr class="segment-lending"><td><strong>Lending</strong></td>${lendingGrowths.map(g => `<td>${g}%</td>`).join('')}<td><strong>${lendingCAGR}%</strong></td></tr>
            <tr class="segment-fs"><td><strong>Financial Services</strong></td>${fsGrowths.map(g => `<td>${g}%</td>`).join('')}<td><strong>${fsCAGR}%</strong></td></tr>
            <tr class="segment-tech"><td><strong>Technology Platform</strong></td>${techGrowths.map(g => `<td>${g}%</td>`).join('')}<td><strong>${techCAGR}%</strong></td></tr>
        `;
    }
}

// Initialize segment sliders - Matching exact format of existing sliders (Member Growth% style)
function initializeSegmentSliders() {
    const container = document.getElementById('segmentSlidersContainer');
    if (!container) return;
    
    const segments = [
        { id: 'lending', label: 'LENDING GROWTH%', defaults: { 2026: 28, 2027: 25, 2028: 22, 2029: 18, 2030: 14 }, min: 5, max: 50, format: v => v + '%' },
        { id: 'fs', label: 'FIN. SERVICES GROWTH%', defaults: { 2026: 70, 2027: 60, 2028: 50, 2029: 40, 2030: 21 }, min: 10, max: 100, format: v => v + '%' },
        { id: 'tech', label: 'TECH PLATFORM GROWTH%', defaults: { 2026: 20, 2027: 20, 2028: 20, 2029: 33, 2030: 72 }, min: 5, max: 80, format: v => v + '%' }
    ];
    
    segments.forEach(seg => {
        // Create filter container matching existing style
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';
        
        // Add label header
        const labelDiv = document.createElement('div');
        labelDiv.className = 'filter-label-header';
        labelDiv.textContent = seg.label;
        filterContainer.appendChild(labelDiv);
        
        // Add year rows
        for (let year = 2026; year <= 2030; year++) {
            const yearRow = document.createElement('div');
            yearRow.className = 'year-row';
            
            const yearLabel = document.createElement('div');
            yearLabel.className = 'year-label';
            yearLabel.textContent = year;
            yearRow.appendChild(yearLabel);
            
            const sliderGroup = document.createElement('div');
            sliderGroup.className = 'slider-group-horizontal';
            sliderGroup.innerHTML = `
                <span class="slider-value" id="${seg.id}Growth${year}Value">${seg.format(seg.defaults[year])}</span>
                <input type="range" id="${seg.id}Growth${year}" min="${seg.min}" max="${seg.max}" value="${seg.defaults[year]}" step="1">
            `;
            yearRow.appendChild(sliderGroup);
            
            const sliderElement = sliderGroup.querySelector(`#${seg.id}Growth${year}`);
            sliderElement.addEventListener('input', function() {
                document.getElementById(`${seg.id}Growth${year}Value`).textContent = seg.format(this.value);
                updateSegmentCharts();
            });
            
            filterContainer.appendChild(yearRow);
        }
        
        container.appendChild(filterContainer);
    });
}

// Modify the DOMContentLoaded to include segment initialization
const originalDOMContentLoaded = document.addEventListener;
document.addEventListener('DOMContentLoaded', function() {
});


// SOFI Stock - FY25 Actuals & Q1 2026 Quarterly Projection Model
// Q1-Q4 2025 Actuals, Q1 2026 Projections with Interactive Sliders
// Updated with Q4 2025 Earnings (reported Jan 30, 2026)

// Base stock price
const BASE_DATA = {
    currentPrice: 26.60,
    sharesOutstanding: 1.26 // Billions
};

// ============================================
// FY25 QUARTERLY ACTUALS (Q1-Q4 2025)
// ============================================
const QUARTERLY_ACTUALS = {
    Q1: {
        quarter: 'Q1 FY25',
        lending: 413,
        techPlatform: 103,
        financialServices: 303,
        netRevenue: 772,
        salesMarketing: 238,
        gAndA: 156,
        technology: 156,
        costOfOps: 135,
        pretaxIncome: 80,
        netIncome: 71,
        ebitda: 210.3,
        eps: 6,
        members: 10.9,
        products: 15.9,
        netMargin: 9.2,
        ebitdaMargin: 27.3,
        salesMarketingPct: 30.8,
        period: 'actual'
    },
    Q2: {
        quarter: 'Q2 FY25',
        lending: 444,
        techPlatform: 110,
        financialServices: 363,
        netRevenue: 855,
        salesMarketing: 265,
        gAndA: 165,
        technology: 152,
        costOfOps: 150,
        pretaxIncome: 112,
        netIncome: 97,
        ebitda: 249.1,
        eps: 8,
        members: 11.7,
        products: 17.1,
        netMargin: 11.3,
        ebitdaMargin: 29.1,
        salesMarketingPct: 31.0,
        period: 'actual'
    },
    Q3: {
        quarter: 'Q3 FY25',
        lending: 493,
        techPlatform: 115,
        financialServices: 420,
        netRevenue: 962,
        salesMarketing: 287,
        gAndA: 188,
        technology: 167,
        costOfOps: 161,
        pretaxIncome: 149,
        netIncome: 139,
        ebitda: 276.9,
        eps: 12,
        members: 12.6,
        products: 18.6,
        netMargin: 14.4,
        ebitdaMargin: 28.8,
        salesMarketingPct: 29.8,
        period: 'actual'
    },
    Q4: {
        quarter: 'Q4 FY25',
        // Revenue segments (from Q4 2025 earnings report, Jan 30 2026)
        lending: 499,
        techPlatform: 122,
        financialServices: 457,
        netRevenue: 1025,
        // Expenses (estimated from segment data & operating leverage trends)
        salesMarketing: 300,
        gAndA: 190,
        technology: 175,
        costOfOps: 160,
        // Income (reported)
        pretaxIncome: 190,
        netIncome: 174,
        ebitda: 318,
        eps: 13,
        // Operational (reported)
        members: 13.7,
        products: 20.2,
        // Margins
        netMargin: 17.0,
        ebitdaMargin: 31.0,
        salesMarketingPct: 29.3,
        period: 'actual'
    }
};

// ============================================
// REFERENCE DATA FOR YoY & QoQ CALCULATIONS
// ============================================

// FY 2024 Quarterly Reference Data (for FY25 YoY calculations)
const FY2024_QUARTERS = {
    Q1: { netRevenue: 645, netIncome: 48, ebitda: 144 },
    Q2: { netRevenue: 599, netIncome: 17, ebitda: 138 },
    Q3: { netRevenue: 689, netIncome: 61, ebitda: 186 },
    Q4: { netRevenue: 740, netIncome: 112, ebitda: 226 }
};

// FY2024 Quarterly Segment Data (for FY25 segment YoY calculations)
const FY2024_SEGMENT_DATA = {
    Q1: { lending: 351, techPlatform: 89, financialServices: 151 },
    Q2: { lending: 363, techPlatform: 95, financialServices: 191 },
    Q3: { lending: 392, techPlatform: 102, financialServices: 238 },
    Q4: { lending: 398, techPlatform: 97, financialServices: 258 }
};

// FY25 Q1 reference for Q1 2026 YoY calculations
const Q1_2025_REF = {
    netRevenue: 772,
    netIncome: 71,
    ebitda: 210.3,
    lending: 413,
    techPlatform: 103,
    financialServices: 303
};

// Q4 2025 reference for Q1 2026 QoQ calculations
const Q4_2025_REF = {
    lending: 499,
    techPlatform: 122,
    financialServices: 457,
    netRevenue: 1025
};

// ============================================
// Q1 2026 PROJECTION DEFAULTS
// ============================================
// Based on ~8.1% QoQ growth from Q4 2025 and 2026 guidance:
// - Overall: 8.1% QoQ ($1,025M → $1,108M), ~30% annual growth pace
// - Lending: +0.6% QoQ, +22% YoY
// - Financial Services: +6.3% QoQ, +60% YoY (fastest growing)
// - Tech Platform: -1.6% QoQ, +17% YoY
// - Members: ~8% QoQ growth momentum continuing
// - Margins: Higher investment cycle (net margin 17.0% → 15.9%)

const Q1_2026_DEFAULTS = {
    // Revenue segments (8.1% QoQ total from Q4 FY25)
    lending: 502,          // +0.6% QoQ from Q4 $499M, +22% YoY from Q1 FY25 $413M
    techPlatform: 120,     // -1.6% QoQ from Q4 $122M, +17% YoY from Q1 FY25 $103M
    financialServices: 492, // +7.7% QoQ from Q4 $457M, +62% YoY from Q1 FY25 $303M
    netRevenue: 1114,      // +8.7% QoQ from Q4 $1,025M (502+120+492)
    // Expenses (higher investment in growth)
    salesMarketing: 345,   // +15.0% QoQ from Q4 $300M
    gAndA: 195,            // +2.6% QoQ from Q4 $190M
    technology: 183,       // +4.6% QoQ from Q4 $175M
    costOfOps: 171,        // +6.9% QoQ from Q4 $160M
    // Income
    pretaxIncome: 209,
    netIncome: 192,
    ebitda: 340,
    eps: 15,               // cents (192M / 1.26B shares = 15.2¢)
    // Operational
    members: 14.8,         // +8.0% QoQ from Q4 13.7M
    products: 22.0,        // +8.9% QoQ from Q4 20.2M
    // Margins
    netMargin: 17.2,
    ebitdaMargin: 30.5,
    salesMarketingPct: 31.0
};

// Current Q1 2026 values (modified by sliders)
let Q1_2026_CURRENT = { ...Q1_2026_DEFAULTS };

// ============================================
// CHART INSTANCES
// ============================================
let revenueChart, netIncomeChart, segmentChart, epsChart, membersChart, productsChart, expensesChart, marginChart, ebitdaChart, segmentGrowthChart;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Quarterly Model - DOM loaded, starting initialization...');
        initializeCharts();
        initializeSliders();
        updateModel();
        updateCurrentStockPrice();
        console.log('Quarterly Model initialization complete');
    } catch(e) {
        console.error('CRITICAL ERROR during initialization:', e);
    }
});

// ============================================
// SLIDERS - Q1 2026 Projections
// ============================================
function initializeSliders() {
    const container = document.getElementById('quarterlyControlsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const sliderConfigs = [
        { 
            id: 'lending', 
            label: 'Lending Revenue', 
            min: 420, max: 620, step: 5, 
            default: Q1_2026_DEFAULTS.lending,
            format: (v) => '$' + v + 'M',
            impacts: ['Net Revenue', 'Net Margin %']
        },
        { 
            id: 'techPlatform', 
            label: 'Tech Platform', 
            min: 100, max: 160, step: 1, 
            default: Q1_2026_DEFAULTS.techPlatform,
            format: (v) => '$' + v + 'M',
            impacts: ['Net Revenue', 'Net Margin %']
        },
        { 
            id: 'financialServices', 
            label: 'Financial Services', 
            min: 380, max: 560, step: 5, 
            default: Q1_2026_DEFAULTS.financialServices,
            format: (v) => '$' + v + 'M',
            impacts: ['Net Revenue', 'Net Margin %']
        },
        { 
            id: 'salesMarketing', 
            label: 'Sales & Marketing', 
            min: 240, max: 380, step: 5, 
            default: Q1_2026_DEFAULTS.salesMarketing,
            format: (v) => '$' + v + 'M',
            impacts: ['S&M % of Rev']
        },
        { 
            id: 'members', 
            label: 'Members', 
            min: 13.8, max: 16.0, step: 0.1, 
            default: Q1_2026_DEFAULTS.members,
            format: (v) => parseFloat(v).toFixed(1) + 'M',
            impacts: ['YoY Growth %']
        },
        { 
            id: 'products', 
            label: 'Products', 
            min: 20.5, max: 24.0, step: 0.1, 
            default: Q1_2026_DEFAULTS.products,
            format: (v) => parseFloat(v).toFixed(1) + 'M',
            impacts: ['YoY Growth %']
        }
    ];
    
    window.sliderConfigs = sliderConfigs;
    
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'filters-vertical-list';
    
    sliderConfigs.forEach(config => {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container quarterly-filter';
        filterContainer.id = `${config.id}Container`;
        
        filterContainer.innerHTML = `
            <div class="filter-label-header">${config.label}</div>
            <div class="slider-row-single">
                <span class="slider-value" id="${config.id}Value">${config.format(config.default)}</span>
                <span class="slider-delta" id="${config.id}Delta"></span>
                <input type="range" id="${config.id}Slider" 
                       min="${config.min}" max="${config.max}" 
                       value="${config.default}" step="${config.step}"
                       data-default="${config.default}">
            </div>
            <div class="slider-impact" id="${config.id}Impact"></div>
        `;
        
        filtersContainer.appendChild(filterContainer);
    });
    
    container.appendChild(filtersContainer);
    
    function updateSliderFill(slider) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const value = parseFloat(slider.value);
        const percentage = ((value - min) / (max - min)) * 100;
        slider.style.background = `linear-gradient(to right, #00A5E5 0%, #00A5E5 ${percentage}%, #e8e8e8 ${percentage}%, #e8e8e8 100%)`;
    }
    
    sliderConfigs.forEach(config => {
        const slider = document.getElementById(`${config.id}Slider`);
        const container = document.getElementById(`${config.id}Container`);
        
        updateSliderFill(slider);
        
        slider.addEventListener('input', function() {
            const value = parseFloat(this.value);
            const defaultVal = parseFloat(this.dataset.default);
            const delta = value - defaultVal;
            
            updateSliderFill(this);
            
            document.getElementById(`${config.id}Value`).textContent = config.format(value);
            
            const deltaEl = document.getElementById(`${config.id}Delta`);
            if (Math.abs(delta) > 0.01) {
                const deltaSign = delta > 0 ? '+' : '';
                const deltaFormatted = config.id === 'members' || config.id === 'products' 
                    ? deltaSign + delta.toFixed(1) 
                    : deltaSign + Math.round(delta);
                deltaEl.textContent = `(${deltaFormatted})`;
                deltaEl.className = 'slider-delta ' + (delta > 0 ? 'delta-positive' : 'delta-negative');
                container.classList.add('slider-changed');
            } else {
                deltaEl.textContent = '';
                deltaEl.className = 'slider-delta';
                container.classList.remove('slider-changed');
            }
            
            updateSliderImpact(config);
            updateQ1_2026FromSliders();
        });
    });
}

function updateSliderImpact(config) {
    const impactEl = document.getElementById(`${config.id}Impact`);
    if (!impactEl) return;
    
    const lending = parseFloat(document.getElementById('lendingSlider').value);
    const techPlatform = parseFloat(document.getElementById('techPlatformSlider').value);
    const financialServices = parseFloat(document.getElementById('financialServicesSlider').value);
    const netRevenue = lending + techPlatform + financialServices;
    const salesMarketing = parseFloat(document.getElementById('salesMarketingSlider').value);
    const members = parseFloat(document.getElementById('membersSlider').value);
    
    let impactHTML = '';
    
    if (config.id === 'lending') {
        const yoy = ((lending - Q1_2025_REF.lending) / Q1_2025_REF.lending * 100).toFixed(0);
        const qoq = ((lending - Q4_2025_REF.lending) / Q4_2025_REF.lending * 100).toFixed(0);
        impactHTML = `<span class="impact-item">YoY: <strong>+${yoy}%</strong></span>
                      <span class="impact-item">QoQ: <strong>${qoq >= 0 ? '+' : ''}${qoq}%</strong></span>`;
    } else if (config.id === 'techPlatform') {
        const yoy = ((techPlatform - Q1_2025_REF.techPlatform) / Q1_2025_REF.techPlatform * 100).toFixed(0);
        const qoq = ((techPlatform - Q4_2025_REF.techPlatform) / Q4_2025_REF.techPlatform * 100).toFixed(0);
        impactHTML = `<span class="impact-item">YoY: <strong>+${yoy}%</strong></span>
                      <span class="impact-item">QoQ: <strong>${qoq >= 0 ? '+' : ''}${qoq}%</strong></span>`;
    } else if (config.id === 'financialServices') {
        const yoy = ((financialServices - Q1_2025_REF.financialServices) / Q1_2025_REF.financialServices * 100).toFixed(0);
        const qoq = ((financialServices - Q4_2025_REF.financialServices) / Q4_2025_REF.financialServices * 100).toFixed(0);
        impactHTML = `<span class="impact-item">YoY: <strong>+${yoy}%</strong></span>
                      <span class="impact-item">QoQ: <strong>${qoq >= 0 ? '+' : ''}${qoq}%</strong></span>`;
    } else if (config.id === 'salesMarketing') {
        const smPct = (salesMarketing / netRevenue * 100).toFixed(1);
        impactHTML = `<span class="impact-item">S&M %: <strong>${smPct}%</strong> of Rev</span>`;
    } else if (config.id === 'members') {
        const yoyGrowth = ((members - Q1_2025_REF.netRevenue / 772 * 10.9) / (Q1_2025_REF.netRevenue / 772 * 10.9) * 100).toFixed(1);
        const q1Members = 10.9; // Q1 FY25
        const yoy = ((members - q1Members) / q1Members * 100).toFixed(1);
        impactHTML = `<span class="impact-item">YoY: <strong>+${yoy}%</strong> vs Q1 FY25</span>`;
    } else if (config.id === 'products') {
        const q1Products = 15.9; // Q1 FY25
        const products = parseFloat(document.getElementById('productsSlider').value);
        const yoy = ((products - q1Products) / q1Products * 100).toFixed(1);
        impactHTML = `<span class="impact-item">YoY: <strong>+${yoy}%</strong> vs Q1 FY25</span>`;
    }
    
    impactEl.innerHTML = impactHTML;
}

function updateQ1_2026FromSliders() {
    Q1_2026_CURRENT.lending = parseFloat(document.getElementById('lendingSlider').value);
    Q1_2026_CURRENT.techPlatform = parseFloat(document.getElementById('techPlatformSlider').value);
    Q1_2026_CURRENT.financialServices = parseFloat(document.getElementById('financialServicesSlider').value);
    Q1_2026_CURRENT.salesMarketing = parseFloat(document.getElementById('salesMarketingSlider').value);
    Q1_2026_CURRENT.members = parseFloat(document.getElementById('membersSlider').value);
    Q1_2026_CURRENT.products = parseFloat(document.getElementById('productsSlider').value);
    
    // Calculate Net Revenue from segments
    Q1_2026_CURRENT.netRevenue = Q1_2026_CURRENT.lending + Q1_2026_CURRENT.techPlatform + Q1_2026_CURRENT.financialServices;
    
    // Calculate revenue change ratio for scaling metrics
    const revenueRatio = Q1_2026_CURRENT.netRevenue / Q1_2026_DEFAULTS.netRevenue;
    
    // Auto-calculate Net Income (maintaining default margin)
    const defaultNetMargin = Q1_2026_DEFAULTS.netIncome / Q1_2026_DEFAULTS.netRevenue;
    const calculatedNetIncome = Math.round(Q1_2026_CURRENT.netRevenue * defaultNetMargin);
    Q1_2026_CURRENT.netIncome = calculatedNetIncome;
    
    // Auto-calculate EPS
    const epsPerMillion = Q1_2026_DEFAULTS.eps / Q1_2026_DEFAULTS.netIncome;
    Q1_2026_CURRENT.eps = Math.round(calculatedNetIncome * epsPerMillion);
    
    // Auto-calculate EBITDA
    const defaultEbitdaMargin = Q1_2026_DEFAULTS.ebitda / Q1_2026_DEFAULTS.netRevenue;
    Q1_2026_CURRENT.ebitda = Math.round(Q1_2026_CURRENT.netRevenue * defaultEbitdaMargin);
    
    // Scale other expenses proportionally
    Q1_2026_CURRENT.gAndA = Math.round(Q1_2026_DEFAULTS.gAndA * revenueRatio);
    Q1_2026_CURRENT.technology = Math.round(Q1_2026_DEFAULTS.technology * revenueRatio);
    Q1_2026_CURRENT.costOfOps = Math.round(Q1_2026_DEFAULTS.costOfOps * revenueRatio);
    
    // Calculate pretax income
    Q1_2026_CURRENT.pretaxIncome = Math.round(Q1_2026_CURRENT.netIncome / 0.92);
    
    // Calculate margins
    Q1_2026_CURRENT.netMargin = (Q1_2026_CURRENT.netIncome / Q1_2026_CURRENT.netRevenue) * 100;
    Q1_2026_CURRENT.ebitdaMargin = (Q1_2026_CURRENT.ebitda / Q1_2026_CURRENT.netRevenue) * 100;
    Q1_2026_CURRENT.salesMarketingPct = (Q1_2026_CURRENT.salesMarketing / Q1_2026_CURRENT.netRevenue) * 100;
    
    updateModel();
}

function resetControls() {
    Q1_2026_CURRENT = { ...Q1_2026_DEFAULTS };
    
    const sliderResets = [
        { id: 'lending', value: Q1_2026_DEFAULTS.lending, format: (v) => '$' + v + 'M' },
        { id: 'techPlatform', value: Q1_2026_DEFAULTS.techPlatform, format: (v) => '$' + v + 'M' },
        { id: 'financialServices', value: Q1_2026_DEFAULTS.financialServices, format: (v) => '$' + v + 'M' },
        { id: 'salesMarketing', value: Q1_2026_DEFAULTS.salesMarketing, format: (v) => '$' + v + 'M' },
        { id: 'members', value: Q1_2026_DEFAULTS.members, format: (v) => parseFloat(v).toFixed(1) + 'M' },
        { id: 'products', value: Q1_2026_DEFAULTS.products, format: (v) => parseFloat(v).toFixed(1) + 'M' }
    ];
    
    sliderResets.forEach(config => {
        const slider = document.getElementById(`${config.id}Slider`);
        slider.value = config.value;
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const percentage = ((config.value - min) / (max - min)) * 100;
        slider.style.background = `linear-gradient(to right, #00A5E5 0%, #00A5E5 ${percentage}%, #e8e8e8 ${percentage}%, #e8e8e8 100%)`;
        document.getElementById(`${config.id}Value`).textContent = config.format(config.value);
        const deltaEl = document.getElementById(`${config.id}Delta`);
        if (deltaEl) { deltaEl.textContent = ''; deltaEl.className = 'slider-delta'; }
        const impactEl = document.getElementById(`${config.id}Impact`);
        if (impactEl) { impactEl.innerHTML = ''; }
        const container = document.getElementById(`${config.id}Container`);
        if (container) { container.classList.remove('slider-changed'); }
    });
    
    updateModel();
}

// ============================================
// DATA & MODEL UPDATE
// ============================================
function getQuarterlyData() {
    return [
        { ...QUARTERLY_ACTUALS.Q1 },
        { ...QUARTERLY_ACTUALS.Q2 },
        { ...QUARTERLY_ACTUALS.Q3 },
        { ...QUARTERLY_ACTUALS.Q4 },
        { 
            quarter: 'Q1 FY26 (Projected)',
            ...Q1_2026_CURRENT,
            period: 'projection'
        }
    ];
}

function updateModel() {
    const data = getQuarterlyData();
    
    // Q1 2026 projection cards
    document.getElementById('q1_2026Members').textContent = Q1_2026_CURRENT.members.toFixed(1) + 'M';
    document.getElementById('q1_2026Revenue').textContent = '$' + Q1_2026_CURRENT.netRevenue.toLocaleString() + 'M';
    document.getElementById('q1_2026NetIncome').textContent = '$' + Q1_2026_CURRENT.netIncome.toLocaleString() + 'M';
    document.getElementById('q1_2026EPS').textContent = Q1_2026_CURRENT.eps + '¢';
    const qoqGrowth = ((Q1_2026_CURRENT.netRevenue - Q4_2025_REF.netRevenue) / Q4_2025_REF.netRevenue * 100).toFixed(1);
    document.getElementById('q1_2026QoQGrowth').textContent = '+' + qoqGrowth + '%';
    document.getElementById('q1_2026EBITDA').textContent = '$' + Q1_2026_CURRENT.ebitda.toLocaleString() + 'M';
    
    // Update charts
    updateAllCharts(data);
    
    // Update table
    updateQuarterlyTable(data);
    
    // Update assumptions
    updateAssumptions(data);
}

// ============================================
// CHART UPDATES
// ============================================
function updateAllCharts(data) {
    const quarters = data.map(d => d.quarter);
    
    // Revenue Chart
    if (revenueChart) {
        revenueChart.data.labels = quarters;
        revenueChart.data.datasets[0].data = data.map(d => d.netRevenue);
        revenueChart.data.datasets[0].backgroundColor = data.map(d => 
            d.period === 'actual' ? 'rgba(0, 165, 229, 0.7)' : 'rgba(33, 150, 243, 0.7)'
        );
        revenueChart.update();
    }
    
    // Net Income Chart (stacked with CHYM in Q4)
    if (netIncomeChart) {
        const CHYM_Q4_CONTRIBUTION = 30;
        netIncomeChart.data.labels = quarters;
        // Base net income: subtract CHYM from Q4 (index 3)
        netIncomeChart.data.datasets[0].data = data.map((d, i) => 
            i === 3 ? d.netIncome - CHYM_Q4_CONTRIBUTION : d.netIncome
        );
        netIncomeChart.data.datasets[0].backgroundColor = data.map(d => 
            d.period === 'actual' ? 'rgba(76, 175, 80, 0.7)' : 'rgba(76, 175, 80, 0.7)'
        );
        // CHYM contribution: only in Q4 (index 3)
        netIncomeChart.data.datasets[1].data = data.map((d, i) => 
            i === 3 ? CHYM_Q4_CONTRIBUTION : 0
        );
        netIncomeChart.update();
    }
    
    // Segment Chart (stacked bar)
    if (segmentChart) {
        segmentChart.data.labels = quarters;
        segmentChart.data.datasets[0].data = data.map(d => d.lending);
        segmentChart.data.datasets[1].data = data.map(d => d.techPlatform);
        segmentChart.data.datasets[2].data = data.map(d => d.financialServices);
        segmentChart.update();
    }
    
    // EPS Chart
    if (epsChart) {
        epsChart.data.labels = quarters;
        epsChart.data.datasets[0].data = data.map(d => d.eps);
        epsChart.data.datasets[0].backgroundColor = data.map(d => 
            d.period === 'actual' ? 'rgba(0, 165, 229, 0.7)' : 'rgba(33, 150, 243, 0.7)'
        );
        epsChart.update();
    }
    
    // Members Chart
    if (membersChart) {
        membersChart.data.labels = quarters;
        membersChart.data.datasets[0].data = data.map(d => d.members);
        membersChart.update();
    }
    
    // Products Chart
    if (productsChart) {
        productsChart.data.labels = quarters;
        productsChart.data.datasets[0].data = data.map(d => d.products);
        productsChart.update();
    }
    
    // Expenses Chart (stacked)
    if (expensesChart) {
        expensesChart.data.labels = quarters;
        expensesChart.data.datasets[0].data = data.map(d => d.salesMarketing);
        expensesChart.data.datasets[1].data = data.map(d => d.gAndA);
        expensesChart.data.datasets[2].data = data.map(d => d.technology);
        expensesChart.data.datasets[3].data = data.map(d => d.costOfOps);
        expensesChart.update();
    }
    
    // Margin Chart
    if (marginChart) {
        marginChart.data.labels = quarters;
        marginChart.data.datasets[0].data = data.map(d => d.netMargin);
        marginChart.update();
    }
    
    // EBITDA Chart
    if (ebitdaChart) {
        ebitdaChart.data.labels = quarters;
        ebitdaChart.data.datasets[0].data = data.map(d => d.ebitda);
        ebitdaChart.data.datasets[0].backgroundColor = data.map(d => 
            d.period === 'actual' ? 'rgba(0, 165, 229, 0.7)' : 'rgba(33, 150, 243, 0.7)'
        );
        ebitdaChart.update();
    }
    
    // Segment Growth QoQ Chart (4 transitions: Q1→Q2, Q2→Q3, Q3→Q4, Q4→Q1'26)
    if (segmentGrowthChart) {
        const lendingGrowth = [
            ((data[1].lending - data[0].lending) / data[0].lending * 100),
            ((data[2].lending - data[1].lending) / data[1].lending * 100),
            ((data[3].lending - data[2].lending) / data[2].lending * 100),
            ((data[4].lending - data[3].lending) / data[3].lending * 100)
        ];
        const techGrowth = [
            ((data[1].techPlatform - data[0].techPlatform) / data[0].techPlatform * 100),
            ((data[2].techPlatform - data[1].techPlatform) / data[1].techPlatform * 100),
            ((data[3].techPlatform - data[2].techPlatform) / data[2].techPlatform * 100),
            ((data[4].techPlatform - data[3].techPlatform) / data[3].techPlatform * 100)
        ];
        const finServGrowth = [
            ((data[1].financialServices - data[0].financialServices) / data[0].financialServices * 100),
            ((data[2].financialServices - data[1].financialServices) / data[1].financialServices * 100),
            ((data[3].financialServices - data[2].financialServices) / data[2].financialServices * 100),
            ((data[4].financialServices - data[3].financialServices) / data[3].financialServices * 100)
        ];
        
        segmentGrowthChart.data.labels = ['Q1→Q2', 'Q2→Q3', 'Q3→Q4', "Q4→Q1'26"];
        segmentGrowthChart.data.datasets[0].data = lendingGrowth;
        segmentGrowthChart.data.datasets[1].data = techGrowth;
        segmentGrowthChart.data.datasets[2].data = finServGrowth;
        segmentGrowthChart.update();
    }
}

// ============================================
// TABLE UPDATE
// ============================================
function updateQuarterlyTable(data) {
    const tbody = document.getElementById('quarterlyBody');
    tbody.innerHTML = '';
    
    const rows = [
        { label: 'Net Revenue', key: 'netRevenue', format: 'currency' },
        { label: '  Lending', key: 'lending', format: 'currency', indent: true },
        { label: '  Tech Platform', key: 'techPlatform', format: 'currency', indent: true },
        { label: '  Financial Services', key: 'financialServices', format: 'currency', indent: true },
        { label: 'Sales & Marketing', key: 'salesMarketing', format: 'currency' },
        { label: 'Net Income', key: 'netIncome', format: 'currency' },
        { label: 'EPS (cents)', key: 'eps', format: 'cents' },
        { label: 'EBITDA', key: 'ebitda', format: 'currency' },
        { label: 'Net Margin %', key: 'netMargin', format: 'percent' },
        { label: 'Members (M)', key: 'members', format: 'decimal' },
        { label: 'Products (M)', key: 'products', format: 'decimal' }
    ];
    
    rows.forEach(row => {
        const tr = document.createElement('tr');
        
        const formatValue = (val, format) => {
            if (val === null || val === undefined) return 'N/A';
            switch(format) {
                case 'currency': return '$' + Math.round(val).toLocaleString();
                case 'percent': return val.toFixed(1) + '%';
                case 'decimal': return val.toFixed(1);
                case 'cents': return val + '¢';
                default: return val;
            }
        };
        
        let rowHTML = `<td style="${row.indent ? 'padding-left: 20px;' : ''}">${row.label}</td>`;
        
        // Q1-Q4 FY25 (actuals, indices 0-3)
        for (let i = 0; i < 4; i++) {
            rowHTML += `<td class="past-performance-cell">${formatValue(data[i][row.key], row.format)}</td>`;
        }
        
        // Q1 FY26 (projection, index 4)
        rowHTML += `<td class="projection-cell">${formatValue(data[4][row.key], row.format)}</td>`;
        
        tr.innerHTML = rowHTML;
        tbody.appendChild(tr);
    });
}

// ============================================
// ASSUMPTIONS / SUMMARY
// ============================================
function updateAssumptions(data) {
    const content = document.getElementById('assumptionsContent');
    if (!content) return;
    
    const fy25Revenue = data.slice(0, 4).reduce((sum, q) => sum + q.netRevenue, 0);
    const fy25NetIncome = data.slice(0, 4).reduce((sum, q) => sum + q.netIncome, 0);
    const fy25AvgMargin = (fy25NetIncome / fy25Revenue * 100).toFixed(1);
    
    const q1_26 = data[4];
    const q1_25 = data[0];
    const yoyRevGrowth = ((q1_26.netRevenue - q1_25.netRevenue) / q1_25.netRevenue * 100).toFixed(1);
    const yoyNIGrowth = ((q1_26.netIncome - q1_25.netIncome) / q1_25.netIncome * 100).toFixed(0);
    
    content.innerHTML = `
        <ul class="assumptions-list">
            <li><strong>FY25 Actuals:</strong> Revenue $${fy25Revenue.toLocaleString()}M, Net Income $${fy25NetIncome.toLocaleString()}M, Avg Net Margin ${fy25AvgMargin}% — Record $1B+ quarterly revenue in Q4</li>
            <li><strong>Q4 FY25 Highlights:</strong> Revenue $${data[3].netRevenue}M (+${((data[3].netRevenue - FY2024_QUARTERS.Q4.netRevenue) / FY2024_QUARTERS.Q4.netRevenue * 100).toFixed(0)}% YoY), Record 1M+ new members, 13.7M total members, Fee-based revenue $443M (+53% YoY)</li>
            <li><strong>Q1 FY26 Projection:</strong> Revenue $${q1_26.netRevenue}M (+${yoyRevGrowth}% YoY), Net Income $${q1_26.netIncome}M (+${yoyNIGrowth}% YoY)</li>
            <li><strong>2026 Guidance:</strong> ~$4.655B adjusted net revenue (~30% growth), Lending +23%, Financial Services +40%+, Tech Platform +20%</li>
            <li><strong>Growth Drivers:</strong> Loan Platform Business at $15B annualized originations, crypto/blockchain launch, 40% cross-buy rate, 9.6% unaided brand awareness</li>
        </ul>
    `;
}

// ============================================
// STOCK PRICE
// ============================================
async function updateCurrentStockPrice() {
    const priceElement = document.getElementById('currentStockPrice');
    const changeElement = document.getElementById('priceChange');
    
    if (changeElement) changeElement.textContent = '';
    if (BASE_DATA.currentPrice && priceElement) {
        priceElement.textContent = `$${BASE_DATA.currentPrice.toFixed(2)}`;
    }
    
    // Try multiple proxies/APIs for reliability (same as Yearly model)
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
    
    setTimeout(updateCurrentStockPrice, 60000);
}

// ============================================
// CHART INITIALIZATION
// ============================================
function initializeCharts() {
    if (typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
    }
    
    // YoY reference arrays: indices 0-3 = FY24 quarters, index 4 = Q1 FY25
    const yoyRevenueRefs = [FY2024_QUARTERS.Q1.netRevenue, FY2024_QUARTERS.Q2.netRevenue, FY2024_QUARTERS.Q3.netRevenue, FY2024_QUARTERS.Q4.netRevenue, Q1_2025_REF.netRevenue];
    const yoyNetIncomeRefs = [FY2024_QUARTERS.Q1.netIncome, FY2024_QUARTERS.Q2.netIncome, FY2024_QUARTERS.Q3.netIncome, FY2024_QUARTERS.Q4.netIncome, Q1_2025_REF.netIncome];
    const yoyEbitdaRefs = [FY2024_QUARTERS.Q1.ebitda, FY2024_QUARTERS.Q2.ebitda, FY2024_QUARTERS.Q3.ebitda, FY2024_QUARTERS.Q4.ebitda, Q1_2025_REF.ebitda];
    
    // Segment YoY refs: indices 0-3 = FY24, index 4 = Q1 FY25
    const yoySegmentRefs = [FY2024_SEGMENT_DATA.Q1, FY2024_SEGMENT_DATA.Q2, FY2024_SEGMENT_DATA.Q3, FY2024_SEGMENT_DATA.Q4, Q1_2025_REF];
    
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.91,
        plugins: {
            legend: { 
                display: true, 
                position: 'top',
                labels: { color: '#000000', font: { size: 11 } }
            },
            datalabels: {
                display: true,
                color: '#000000',
                anchor: 'end',
                align: 'top',
                offset: 4,
                font: { size: 10, weight: 'bold' },
                padding: { top: 4 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: '#000000' },
                grid: { color: 'rgba(0, 0, 0, 0.08)' }
            },
            x: {
                ticks: { color: '#000000', font: { size: 9 } },
                grid: { color: 'rgba(0, 0, 0, 0.08)' }
            }
        }
    };
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        revenueChart = new Chart(revenueCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Net Revenue ($M)',
                    data: [],
                    backgroundColor: 'rgba(0, 165, 229, 0.7)',
                    borderColor: '#00A5E5',
                    borderWidth: 2
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    datalabels: {
                        display: true,
                        color: '#000000',
                        anchor: 'end',
                        align: 'top',
                        offset: 4,
                        font: { size: 9, weight: 'bold' },
                        formatter: (value, context) => {
                            const data = context.chart.data.datasets[0].data;
                            const index = context.dataIndex;
                            let label = '$' + value + 'M';
                            if (index > 0 && data[index - 1] > 0) {
                                const qoqGrowth = ((value - data[index - 1]) / data[index - 1] * 100).toFixed(1);
                                label += '\nQoQ ' + (qoqGrowth >= 0 ? '+' : '') + qoqGrowth + '%';
                            }
                            if (yoyRevenueRefs[index] > 0) {
                                const yoyGrowth = ((value - yoyRevenueRefs[index]) / yoyRevenueRefs[index] * 100).toFixed(0);
                                label += '\nYoY +' + yoyGrowth + '%';
                            }
                            return label;
                        }
                    }
                }
            }
        });
    }
    
    // Net Income Chart (stacked with CHYM in Q4)
    const netIncomeCtx = document.getElementById('netIncomeChart');
    if (netIncomeCtx) {
        netIncomeChart = new Chart(netIncomeCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Net Income ($M)',
                        data: [],
                        backgroundColor: 'rgba(76, 175, 80, 0.7)',
                        borderColor: '#4caf50',
                        borderWidth: 2
                    },
                    {
                        label: '$CHYM Termination Fee',
                        data: [],
                        backgroundColor: 'rgba(255, 152, 0, 0.85)',
                        borderColor: '#ff9800',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    x: { ...commonOptions.scales.x, stacked: true },
                    y: { ...commonOptions.scales.y, stacked: true, min: 0, max: 300 }
                },
                plugins: {
                    ...commonOptions.plugins,
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#000000', font: { size: 10 }, boxWidth: 12, padding: 8 }
                    },
                    datalabels: {
                        display: function(context) {
                            const datasetIndex = context.datasetIndex;
                            const dataIndex = context.dataIndex;
                            if (dataIndex === 3) return datasetIndex === 1;
                            return datasetIndex === 0;
                        },
                        color: '#000000',
                        anchor: 'end',
                        align: 'top',
                        offset: 4,
                        font: { size: 9, weight: 'bold' },
                        formatter: (value, context) => {
                            const dataIndex = context.dataIndex;
                            const baseData = context.chart.data.datasets[0].data;
                            const chymData = context.chart.data.datasets[1].data;
                            const totalValue = baseData[dataIndex] + (chymData[dataIndex] || 0);
                            
                            let label = '$' + totalValue + 'M';
                            if (dataIndex === 3) label += ' (incl $30M CHYM)';
                            
                            if (dataIndex > 0) {
                                const prevTotal = baseData[dataIndex - 1] + (chymData[dataIndex - 1] || 0);
                                if (prevTotal > 0) {
                                    const qoqGrowth = ((totalValue - prevTotal) / prevTotal * 100).toFixed(0);
                                    label += '\nQoQ ' + (qoqGrowth >= 0 ? '+' : '') + qoqGrowth + '%';
                                }
                            }
                            if (yoyNetIncomeRefs[dataIndex] > 0) {
                                const yoyGrowth = ((totalValue - yoyNetIncomeRefs[dataIndex]) / yoyNetIncomeRefs[dataIndex] * 100).toFixed(0);
                                label += '\nYoY +' + yoyGrowth + '%';
                            }
                            return label;
                        }
                    }
                }
            }
        });
    }
    
    // Segment Chart (Stacked Bar)
    const segmentCtx = document.getElementById('segmentChart');
    if (segmentCtx) {
        segmentChart = new Chart(segmentCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    { label: 'Lending', data: [], backgroundColor: 'rgba(0, 165, 229, 0.8)', borderColor: '#00A5E5', borderWidth: 1 },
                    { label: 'Tech Platform', data: [], backgroundColor: 'rgba(156, 39, 176, 0.7)', borderColor: '#9c27b0', borderWidth: 1 },
                    { label: 'Financial Services', data: [], backgroundColor: 'rgba(76, 175, 80, 0.7)', borderColor: '#4caf50', borderWidth: 1 }
                ]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    x: { ...commonOptions.scales.x, stacked: true },
                    y: { ...commonOptions.scales.y, stacked: true }
                },
                plugins: {
                    ...commonOptions.plugins,
                    datalabels: {
                        display: true,
                        color: '#000000',
                        anchor: 'center',
                        align: 'center',
                        font: { size: 8, weight: 'bold' },
                        formatter: (value, context) => {
                            if (value <= 100) return '';
                            const datasetIndex = context.datasetIndex;
                            const quarterIndex = context.dataIndex;
                            const segmentKey = ['lending', 'techPlatform', 'financialServices'][datasetIndex];
                            
                            const yoyRef = yoySegmentRefs[quarterIndex];
                            const yoyValue = yoyRef[segmentKey];
                            const yoyGrowth = ((value - yoyValue) / yoyValue * 100).toFixed(0);
                            const yoySign = yoyGrowth >= 0 ? '+' : '';
                            
                            let qoqStr = '';
                            if (quarterIndex > 0) {
                                const prevValue = context.chart.data.datasets[datasetIndex].data[quarterIndex - 1];
                                if (prevValue > 0) {
                                    const qoqGrowth = ((value - prevValue) / prevValue * 100).toFixed(0);
                                    qoqStr = '\nQoQ ' + (qoqGrowth >= 0 ? '+' : '') + qoqGrowth + '%';
                                }
                            }
                            
                            return '$' + value + 'M' + qoqStr + '\nYoY ' + yoySign + yoyGrowth + '%';
                        }
                    }
                }
            }
        });
    }
    
    // EPS Chart
    const epsCtx = document.getElementById('epsChart');
    if (epsCtx) {
        epsChart = new Chart(epsCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'EPS (cents)',
                    data: [],
                    backgroundColor: 'rgba(0, 165, 229, 0.7)',
                    borderColor: '#00A5E5',
                    borderWidth: 2
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    datalabels: { ...commonOptions.plugins.datalabels, formatter: (v) => v + '¢' }
                }
            }
        });
    }
    
    // Members Chart
    const membersCtx = document.getElementById('membersChart');
    if (membersCtx) {
        membersChart = new Chart(membersCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Members (M)',
                    data: [],
                    borderColor: '#00A5E5',
                    backgroundColor: 'rgba(0, 165, 229, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: '#00A5E5',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    datalabels: {
                        display: true,
                        color: '#000000',
                        anchor: 'end',
                        align: 'top',
                        offset: 6,
                        font: { size: 10, weight: 'bold' },
                        formatter: (value, context) => {
                            const data = context.chart.data.datasets[0].data;
                            const index = context.dataIndex;
                            let label = value.toFixed(1) + 'M';
                            if (index > 0) {
                                const qoqGrowthM = value - data[index - 1];
                                label += '\nQoQ ' + (qoqGrowthM >= 0 ? '+' : '') + qoqGrowthM.toFixed(2) + 'M';
                            }
                            return label;
                        }
                    }
                },
                scales: {
                    ...commonOptions.scales,
                    y: { ...commonOptions.scales.y, min: 0, max: 18 }
                }
            }
        });
    }
    
    // Products Chart
    const productsCtx = document.getElementById('productsChart');
    if (productsCtx) {
        productsChart = new Chart(productsCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Products (M)',
                    data: [],
                    borderColor: '#9c27b0',
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: '#9c27b0',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    datalabels: {
                        display: true,
                        color: '#000000',
                        anchor: 'end',
                        align: 'top',
                        offset: 6,
                        font: { size: 11, weight: 'bold' },
                        formatter: (v) => v.toFixed(1) + 'M'
                    }
                }
            }
        });
    }
    
    // Expenses Chart (Stacked Bar)
    const expensesCtx = document.getElementById('expensesChart');
    if (expensesCtx) {
        expensesChart = new Chart(expensesCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    { label: 'Sales & Marketing', data: [], backgroundColor: 'rgba(244, 67, 54, 0.7)', borderColor: '#f44336', borderWidth: 1 },
                    { label: 'G&A', data: [], backgroundColor: 'rgba(255, 152, 0, 0.7)', borderColor: '#ff9800', borderWidth: 1 },
                    { label: 'Technology', data: [], backgroundColor: 'rgba(33, 150, 243, 0.7)', borderColor: '#2196f3', borderWidth: 1 },
                    { label: 'Cost of Ops', data: [], backgroundColor: 'rgba(158, 158, 158, 0.7)', borderColor: '#9e9e9e', borderWidth: 1 }
                ]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    x: { ...commonOptions.scales.x, stacked: true },
                    y: { ...commonOptions.scales.y, stacked: true }
                },
                plugins: {
                    ...commonOptions.plugins,
                    datalabels: {
                        display: true,
                        color: '#000000',
                        anchor: 'center',
                        align: 'center',
                        font: { size: 9, weight: 'bold' },
                        formatter: (v) => v >= 130 ? '$' + v + 'M' : ''
                    }
                }
            }
        });
    }
    
    // Margin Chart
    const marginCtx = document.getElementById('marginChart');
    if (marginCtx) {
        marginChart = new Chart(marginCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Net Margin %',
                    data: [],
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: '#4caf50',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    datalabels: {
                        display: true,
                        color: '#000000',
                        anchor: 'end',
                        align: 'top',
                        offset: 6,
                        font: { size: 11, weight: 'bold' },
                        formatter: (v) => v.toFixed(1) + '%'
                    }
                },
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        ticks: { ...commonOptions.scales.y.ticks, callback: (v) => v + '%' }
                    }
                }
            }
        });
    }
    
    // EBITDA Chart
    const ebitdaCtx = document.getElementById('ebitdaChart');
    if (ebitdaCtx) {
        ebitdaChart = new Chart(ebitdaCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'EBITDA ($M)',
                    data: [],
                    backgroundColor: 'rgba(0, 165, 229, 0.7)',
                    borderColor: '#00A5E5',
                    borderWidth: 2
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: { ...commonOptions.scales.y, min: 0, max: 370 }
                },
                plugins: {
                    ...commonOptions.plugins,
                    datalabels: {
                        ...commonOptions.plugins.datalabels,
                        font: { size: 9, weight: 'bold' },
                        formatter: (value, context) => {
                            const data = context.chart.data.datasets[0].data;
                            const index = context.dataIndex;
                            let label = '$' + Math.round(value) + 'M';
                            if (index > 0 && data[index - 1] > 0) {
                                const qoqGrowth = ((value - data[index - 1]) / data[index - 1] * 100).toFixed(0);
                                label += '\nQoQ ' + (qoqGrowth >= 0 ? '+' : '') + qoqGrowth + '%';
                            }
                            if (yoyEbitdaRefs[index] > 0) {
                                const yoyGrowth = ((value - yoyEbitdaRefs[index]) / yoyEbitdaRefs[index] * 100).toFixed(0);
                                label += '\nYoY +' + yoyGrowth + '%';
                            }
                            return label;
                        }
                    }
                }
            }
        });
    }
    
    // Segment Growth QoQ Chart (4 transitions now)
    const segmentGrowthCtx = document.getElementById('segmentGrowthChart');
    if (segmentGrowthCtx) {
        segmentGrowthChart = new Chart(segmentGrowthCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Q1→Q2', 'Q2→Q3', 'Q3→Q4', "Q4→Q1'26"],
                datasets: [
                    { label: 'Lending', data: [], backgroundColor: 'rgba(0, 165, 229, 0.7)', borderColor: '#00A5E5', borderWidth: 2 },
                    { label: 'Tech Platform', data: [], backgroundColor: 'rgba(255, 193, 7, 0.7)', borderColor: '#FFC107', borderWidth: 2 },
                    { label: 'Financial Services', data: [], backgroundColor: 'rgba(76, 175, 80, 0.7)', borderColor: '#4caf50', borderWidth: 2 }
                ]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    datalabels: {
                        ...commonOptions.plugins.datalabels,
                        font: { size: 9, weight: 'bold' },
                        formatter: (v) => (v >= 0 ? '+' : '') + v.toFixed(0) + '%'
                    }
                },
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        min: -10,
                        max: 25,
                        ticks: { ...commonOptions.scales.y.ticks, callback: (v) => v + '%' }
                    }
                }
            }
        });
    }
    
    console.log('All quarterly charts initialized (5 quarters: Q1-Q4 FY25 + Q1 FY26)');
}

// E-Commerce Dashboard JavaScript
console.log("🚀 Dashboard JavaScript initialized");

// Global variables
let dashboardData = {};
let lastUpdateTime = null;

// Format currency
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Format number
function formatNumber(num) {
    return num.toLocaleString('en-US');
}

// Update current time
function updateCurrentTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = 
        `Last updated: ${now.toLocaleTimeString()}`;
    document.getElementById('last-updated').textContent = 
        `Last updated: ${now.toLocaleString()}`;
    lastUpdateTime = now;
}

// Fetch dashboard statistics
async function fetchDashboardStats() {
    try {
        console.log("📊 Fetching dashboard statistics...");
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        dashboardData.stats = data;
        
        // Update UI
        document.getElementById('total-revenue').textContent = formatCurrency(data.total_revenue);
        document.getElementById('total-orders').textContent = formatNumber(data.total_orders);
        document.getElementById('total-customers').textContent = formatNumber(data.total_customers);
        document.getElementById('total-products').textContent = formatNumber(data.total_products);
        document.getElementById('low-stock-count').textContent = data.low_stock_count;
        
        console.log("✅ Dashboard stats loaded:", data);
        return data;
    } catch (error) {
        console.error("❌ Error fetching dashboard stats:", error);
        showError("Failed to load dashboard statistics");
        return null;
    }
}

// Fetch sales trend and create chart
async function fetchSalesTrend() {
    try {
        console.log("📈 Fetching sales trend...");
        const response = await fetch('/api/dashboard/sales-trend');
        const data = await response.json();
        
        // Create chart
        const trace = {
            x: data.months,
            y: data.sales,
            type: 'scatter',
            mode: 'lines+markers',
            line: {
                color: '#4e73df',
                width: 3
            },
            marker: {
                size: 8,
                color: '#4e73df'
            },
            fill: 'tozeroy',
            fillcolor: 'rgba(78, 115, 223, 0.1)'
        };
        
        const layout = {
            title: 'Monthly Sales Trend',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                family: 'Arial, sans-serif',
                size: 12
            },
            xaxis: {
                title: 'Month',
                gridcolor: 'rgba(0,0,0,0.1)'
            },
            yaxis: {
                title: 'Sales ($)',
                gridcolor: 'rgba(0,0,0,0.1)',
                tickprefix: '$'
            },
            margin: {
                l: 60,
                r: 30,
                b: 60,
                t: 60,
                pad: 4
            },
            showlegend: false
        };
        
        Plotly.newPlot('sales-chart', [trace], layout);
        console.log("✅ Sales chart created");
        
    } catch (error) {
        console.error("❌ Error creating sales chart:", error);
    }
}

// Fetch top products
async function fetchTopProducts() {
    try {
        console.log("🏆 Fetching top products...");
        const response = await fetch('/api/dashboard/top-products');
        const products = await response.json();
        
        const tableBody = document.getElementById('top-products-body');
        tableBody.innerHTML = '';
        
        products.forEach((product, index) => {
            const row = document.createElement('tr');
            const rankBadge = index < 3 ? 
                `<span class="badge bg-warning">#${index + 1}</span>` : 
                `<span class="badge bg-secondary">#${index + 1}</span>`;
            
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${formatCurrency(product.revenue)}</td>
                <td>${formatNumber(product.units)}</td>
                <td>${rankBadge}</td>
            `;
            tableBody.appendChild(row);
        });
        
        console.log("✅ Top products loaded");
        
    } catch (error) {
        console.error("❌ Error fetching top products:", error);
    }
}

// Fetch customer distribution
async function fetchCustomerDistribution() {
    try {
        console.log("🌍 Fetching customer distribution...");
        const response = await fetch('/api/dashboard/customers');
        const distribution = await response.json();
        
        // Update country count
        const countryCount = Object.keys(distribution).length;
        document.getElementById('country-count').textContent = countryCount;
        
        // Create pie chart
        const labels = Object.keys(distribution);
        const values = Object.values(distribution);
        
        const trace = {
            labels: labels,
            values: values,
            type: 'pie',
            hole: 0.4,
            marker: {
                colors: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#6c757d']
            },
            textinfo: 'label+percent',
            textposition: 'outside'
        };
        
        const layout = {
            title: 'Customer Distribution by Country',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            showlegend: true,
            legend: {
                x: 1,
                y: 0.5
            },
            margin: {
                l: 30,
                r: 30,
                b: 30,
                t: 50,
                pad: 4
            }
        };
        
        Plotly.newPlot('customer-chart', [trace], layout);
        console.log("✅ Customer chart created");
        
    } catch (error) {
        console.error("❌ Error fetching customer distribution:", error);
    }
}

// Fetch low stock products
async function fetchLowStock() {
    try {
        console.log("⚠️ Fetching low stock products...");
        const response = await fetch('/api/dashboard/low-stock');
        const products = await response.json();
        
        const tableBody = document.getElementById('low-stock-body');
        tableBody.innerHTML = '';
        
        if (products.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-success">
                        <i class="fas fa-check-circle"></i> All products are well stocked!
                    </td>
                </tr>
            `;
            return;
        }
        
        products.forEach(product => {
            const statusClass = product.status === 'Critical' ? 'bg-danger' : 'bg-warning';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${formatNumber(product.stock)}</td>
                <td><span class="badge ${statusClass}">${product.status}</span></td>
            `;
            tableBody.appendChild(row);
        });
        
        console.log("✅ Low stock products loaded");
        
    } catch (error) {
        console.error("❌ Error fetching low stock products:", error);
    }
}

// Fetch recent orders
async function fetchRecentOrders() {
    try {
        console.log("🔄 Fetching recent orders...");
        const response = await fetch('/api/dashboard/recent-orders');
        const orders = await response.json();
        
        const tableBody = document.getElementById('recent-orders-body');
        tableBody.innerHTML = '';
        
        orders.forEach(order => {
            const statusClass = order.status === 'Delivered' ? 'bg-success' : 
                              order.status === 'Processing' ? 'bg-warning' : 
                              order.status === 'Shipped' ? 'bg-info' : 'bg-secondary';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.product}</td>
                <td>${formatNumber(order.quantity)}</td>
                <td>${formatCurrency(order.total)}</td>
                <td><span class="badge ${statusClass}">${order.status}</span></td>
            `;
            tableBody.appendChild(row);
        });
        
        console.log("✅ Recent orders loaded");
        
    } catch (error) {
        console.error("❌ Error fetching recent orders:", error);
    }
}


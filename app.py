 
from flask import Flask, render_template, jsonify
from config import Config
from database import db, Product, Customer, Order
from datetime import datetime, timedelta
import random

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

def create_sample_data():
    """Create sample data for the dashboard"""
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        # Create sample products
        products = [
            Product(name='Laptop Pro', category='Electronics', price=999.99, stock=50),
            Product(name='Smartphone X', category='Electronics', price=699.99, stock=100),
            Product(name='Wireless Headphones', category='Audio', price=199.99, stock=75),
            Product(name='Gaming Mouse', category='Accessories', price=49.99, stock=150),
            Product(name='Mechanical Keyboard', category='Accessories', price=129.99, stock=60),
            Product(name='4K Monitor', category='Electronics', price=349.99, stock=30),
            Product(name='USB-C Hub', category='Accessories', price=39.99, stock=200),
            Product(name='Laptop Bag', category='Accessories', price=59.99, stock=80)
        ]
        
        # Create sample customers
        customers = [
            Customer(name='John Smith', email='john@email.com', country='USA'),
            Customer(name='Emma Wilson', email='emma@email.com', country='UK'),
            Customer(name='Raj Patel', email='raj@email.com', country='India'),
            Customer(name='Maria Garcia', email='maria@email.com', country='Spain'),
            Customer(name='David Brown', email='david@email.com', country='Canada'),
            Customer(name='Lisa Chen', email='lisa@email.com', country='China'),
            Customer(name='Michael Johnson', email='michael@email.com', country='Australia'),
            Customer(name='Sarah Miller', email='sarah@email.com', country='USA')
        ]
        
        db.session.add_all(products)
        db.session.add_all(customers)
        db.session.commit()
        
        # Create sample orders
        statuses = ['Delivered', 'Processing', 'Shipped', 'Pending']
        for i in range(50):
            customer = random.choice(customers)
            product = random.choice(products)
            quantity = random.randint(1, 3)
            total = product.price * quantity
            
            # Random date in last 90 days
            days_ago = random.randint(1, 90)
            order_date = datetime.now() - timedelta(days=days_ago)
            
            order = Order(
                customer_id=customer.id,
                product_id=product.id,
                quantity=quantity,
                order_date=order_date,
                status=random.choice(statuses),
                total_amount=total
            )
            db.session.add(order)
        
        db.session.commit()
        print("✅ Sample data created successfully!")

# Routes
@app.route('/')
def index():
    """Render the main dashboard"""
    return render_template('index.html')

@app.route('/api/dashboard/stats')
def dashboard_stats():
    """Get dashboard statistics"""
    try:
        total_products = Product.query.count()
        total_customers = Customer.query.count()
        total_orders = Order.query.count()
        
        # Calculate total revenue
        orders = Order.query.all()
        total_revenue = sum([order.total_amount for order in orders])
        
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        # Low stock products
        low_stock = Product.query.filter(Product.stock < 20).count()
        
        return jsonify({
            'total_revenue': round(total_revenue, 2),
            'total_orders': total_orders,
            'total_customers': total_customers,
            'total_products': total_products,
            'avg_order_value': round(avg_order_value, 2),
            'low_stock_count': low_stock
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/sales-trend')
def sales_trend():
    """Get sales data for chart"""
    try:
        # Generate sample sales data for last 6 months
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        sales = [15000, 22000, 18000, 25000, 30000, 27000]
        
        return jsonify({
            'months': months,
            'sales': sales
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/top-products')
def top_products():
    """Get top selling products"""
    try:
        # Sample top products
        top_products = [
            {'name': 'Laptop Pro', 'revenue': 12000, 'units': 12},
            {'name': 'Smartphone X', 'revenue': 8900, 'units': 13},
            {'name': '4K Monitor', 'revenue': 5400, 'units': 15},
            {'name': 'Wireless Headphones', 'revenue': 3200, 'units': 16},
            {'name': 'Mechanical Keyboard', 'revenue': 2100, 'units': 16}
        ]
        
        return jsonify(top_products)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/customers')
def customer_distribution():
    """Get customer distribution by country"""
    try:
        distribution = {
            'USA': 42,
            'UK': 23,
            'India': 15,
            'Canada': 9,
            'Australia': 8,
            'Others': 12
        }
        
        return jsonify(distribution)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/low-stock')
def low_stock():
    """Get low stock products"""
    try:
        low_stock_products = [
            {'name': 'Webcam', 'category': 'Electronics', 'stock': 8, 'status': 'Critical'},
            {'name': 'Mouse', 'category': 'Accessories', 'stock': 12, 'status': 'Low'},
            {'name': 'Tablet', 'category': 'Electronics', 'stock': 5, 'status': 'Critical'},
            {'name': 'Charger', 'category': 'Accessories', 'stock': 15, 'status': 'Low'}
        ]
        
        return jsonify(low_stock_products)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/recent-orders')
def recent_orders():
    """Get recent orders"""
    try:
        recent_orders = [
            {'id': 1001, 'customer': 'John Smith', 'product': 'Laptop Pro', 'quantity': 1, 'total': 999.99, 'status': 'Delivered'},
            {'id': 1002, 'customer': 'Emma Wilson', 'product': 'Smartphone X', 'quantity': 2, 'total': 1399.98, 'status': 'Processing'},
            {'id': 1003, 'customer': 'Raj Patel', 'product': 'Wireless Headphones', 'quantity': 1, 'total': 199.99, 'status': 'Shipped'},
            {'id': 1004, 'customer': 'Maria Garcia', 'product': 'Gaming Mouse', 'quantity': 3, 'total': 149.97, 'status': 'Pending'},
            {'id': 1005, 'customer': 'David Brown', 'product': 'Mechanical Keyboard', 'quantity': 1, 'total': 129.99, 'status': 'Delivered'}
        ]
        
        return jsonify(recent_orders)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset-data')
def reset_data():
    """Reset database with sample data"""
    try:
        create_sample_data()
        return jsonify({'message': 'Database reset successfully with sample data!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Initialize database
with app.app_context():
    try:
        # Check if database exists
        Product.query.first()
        print("✅ Database already exists")
    except:
        print("🔄 Creating database with sample data...")
        create_sample_data()

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 E-COMMERCE DASHBOARD STARTING")
    print("=" * 50)
    print("📊 Dashboard URL: http://localhost:5000")
    print("📡 API Endpoints:")
    print("   • /api/dashboard/stats")
    print("   • /api/dashboard/sales-trend")
    print("   • /api/dashboard/top-products")
    print("   • /api/reset-data (reset database)")
    print("=" * 50)
    app.run(debug=True, port=5000)
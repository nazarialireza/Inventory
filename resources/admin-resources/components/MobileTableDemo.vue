<!-- Mobile Table Optimization Demo -->
<!-- This demonstrates the responsive table implementation -->

<template>
  <div class="mobile-table-demo">
    <h2>📱 Mobile-Optimized Tables Demo</h2>
    
    <div class="demo-section">
      <h3>🖥️ Desktop View (Traditional Table)</h3>
      <p>On desktop screens (768px+), tables display in traditional format with all columns visible.</p>
      
      <h3>📱 Mobile View (Card Layout)</h3>
      <p>On mobile screens (< 768px), tables transform into user-friendly cards similar to your example:</p>
      
      <div class="mobile-preview">
        <div class="phone-frame">
          <div class="card-demo">
            <!-- Example Product Card -->
            <div class="demo-card">
              <div class="card-header">
                <input type="checkbox" class="form-check-input">
                <div class="card-primary">
                  <div class="card-id">P123</div>
                  <div class="card-title">Enterprise Server</div>
                </div>
                <div class="card-actions">
                  <button class="btn-icon">👁️</button>
                  <button class="btn-icon">✏️</button>
                  <button class="btn-icon">🗑️</button>
                </div>
              </div>
              <div class="card-body">
                <div class="card-field">
                  <span class="field-label">Product Name</span>
                  <span class="field-value">Enterprise Server</span>
                </div>
                <div class="card-field">
                  <span class="field-label">Inventory</span>
                  <span class="field-value status-stable">● Stable</span>
                </div>
                <div class="card-field">
                  <span class="field-label">BP</span>
                  <span class="field-value">13k</span>
                </div>
              </div>
              <div class="card-footer">
                <button class="btn btn-info btn-sm">View More</button>
              </div>
            </div>
            
            <!-- Example Customer Card -->
            <div class="demo-card">
              <div class="card-header">
                <input type="checkbox" class="form-check-input">
                <div class="card-primary">
                  <div class="card-id">C456</div>
                  <div class="card-title">John Smith</div>
                </div>
                <div class="card-actions">
                  <button class="btn-icon">👁️</button>
                  <button class="btn-icon">✏️</button>
                  <button class="btn-icon">🗑️</button>
                </div>
              </div>
              <div class="card-body">
                <div class="card-field">
                  <span class="field-label">Phone</span>
                  <span class="field-value">+1-555-0123</span>
                </div>
                <div class="card-field">
                  <span class="field-label">Email</span>
                  <span class="field-value">john@example.com</span>
                </div>
                <div class="card-field">
                  <span class="field-label">Sale Due</span>
                  <span class="field-value">$1,250.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="features-section">
      <h3>✨ Key Features Implemented</h3>
      <ul>
        <li><strong>Responsive Design:</strong> Automatically switches between table and card views</li>
        <li><strong>Touch-Friendly:</strong> Optimized for mobile touch interactions</li>
        <li><strong>Smart Column Management:</strong> Shows most important fields on mobile</li>
        <li><strong>Expandable Cards:</strong> "View More" button to show additional details</li>
        <li><strong>RTL Support:</strong> Full support for Dari/Arabic languages</li>
        <li><strong>Consistent Actions:</strong> Action buttons work the same across devices</li>
        <li><strong>Selection Support:</strong> Bulk selection works on both views</li>
      </ul>
    </div>
    
    <div class="implementation-section">
      <h3>🔧 Implementation Status</h3>
      <div class="status-grid">
        <div class="status-item completed">
          <span class="status-icon">✅</span>
          <span>ResponsiveDataTable Component Created</span>
        </div>
        <div class="status-item completed">
          <span class="status-icon">✅</span>
          <span>Mobile CSS Utilities Added</span>
        </div>
        <div class="status-item completed">
          <span class="status-icon">✅</span>
          <span>Products Module Updated</span>
        </div>
        <div class="status-item completed">
          <span class="status-icon">✅</span>
          <span>Customers Module Updated</span>
        </div>
        <div class="status-item ready">
          <span class="status-icon">🔄</span>
          <span>Template Available for Other Modules</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-table-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-section {
  margin-bottom: 40px;
}

.mobile-preview {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.phone-frame {
  width: 375px;
  height: 600px;
  border: 8px solid #333;
  border-radius: 25px;
  background: #f5f5f5;
  padding: 20px;
  overflow-y: auto;
}

.card-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f3f4f6;
}

.card-primary {
  flex: 1;
}

.card-id {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-body {
  padding: 12px 16px;
}

.card-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f8fafc;
}

.card-field:last-child {
  border-bottom: none;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.field-value {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.status-stable {
  color: #059669;
}

.card-footer {
  padding: 8px 16px;
  text-align: center;
  border-top: 1px solid #f3f4f6;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.btn-info {
  background: #3b82f6;
  color: white;
}

.features-section ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
  list-style: none;
  padding: 0;
}

.features-section li {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.status-item.completed {
  background: #ecfdf5;
  border-color: #10b981;
}

.status-item.ready {
  background: #eff6ff;
  border-color: #3b82f6;
}

.status-icon {
  font-size: 20px;
}

h2 {
  color: #111827;
  text-align: center;
  margin-bottom: 32px;
}

h3 {
  color: #374151;
  margin-bottom: 16px;
}
</style>
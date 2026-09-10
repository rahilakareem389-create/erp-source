const fs = require('fs');
let content = fs.readFileSync('src/pages/CustomerOrders.jsx', 'utf8');

const mainReturnIdx = content.indexOf('return (', 8000);

const validJSX = `return (
    <div style={{ padding: '40px 24px', maxWidth: 1000, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>Welcome, {customer.name}</h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: 15 }}>Manage your orders and shop products.</p>
          </div>
          <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#fef2f2', color: '#ef4444', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            Logout
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          <button onClick={() => setActiveTab('store')} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: activeTab === 'store' ? '#0f172a' : '#f8fafc', color: activeTab === 'store' ? 'white' : '#64748b', fontWeight: 800, cursor: 'pointer' }}>Shop Products</button>
          <button onClick={() => setActiveTab('orders')} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: activeTab === 'orders' ? '#0f172a' : '#f8fafc', color: activeTab === 'orders' ? 'white' : '#64748b', fontWeight: 800, cursor: 'pointer' }}>My Orders</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b', fontWeight: 600 }}>Loading...</div>
        ) : activeTab === 'store' ? (
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {products.map(p => (
                <div key={p.id} style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>{p.name}</h3>
                  <p style={{ margin: '0 0 16px 0', color: '#0a84ff', fontWeight: 800 }}>Rs. {p.sellingPrice}</p>
                  <button onClick={() => addToCart(p)} style={{ width: '100%', padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Add to Cart</button>
                </div>
              ))}
            </div>
            <div style={{ width: 300, background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px 0' }}>Your Cart</h3>
              {cart.length === 0 ? <p style={{ color: '#94a3b8' }}>Cart is empty</p> : (
                <div>
                  {cart.map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                      <span>{i.name} (x{i.qty})</span>
                      <span>Rs. {i.sellingPrice * i.qty}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>Total:</span>
                    <span>Rs. {cart.reduce((s, i) => s + (i.sellingPrice * i.qty), 0)}</span>
                  </div>
                  <button onClick={placeOrder} style={{ width: '100%', padding: 12, background: '#0a84ff', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, marginTop: 16, cursor: 'pointer' }}>Place Order</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 24, border: '1px dashed #cbd5e1' }}>
                <ShoppingBag size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, color: '#475569', fontWeight: 700 }}>No orders found</h3>
              </div>
            ) : (
              orders.map(order => {
                const canReturn = order.orderStatus === 'Delivered';
                return (
                  <div key={order.id} style={{ background: 'white', borderRadius: 24, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Order Placed</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Total Amount</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a' }}>\${parseFloat(order.grandTotal).toFixed(2)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Order #{order.id.toString().slice(0, 8).toUpperCase()}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontWeight: 800, color: order.orderStatus === 'Delivered' ? '#10b981' : '#3b82f6' }}>{order.orderStatus}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        {order.Items?.map(item => (
                          <div key={item.id} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                            <div style={{ width: 64, height: 64, background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <PackageX size={24} color="#94a3b8" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>{item.Product?.name}</div>
                              <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Qty: {item.quantity} @ \${parseFloat(item.price).toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        {canReturn ? (
                          <button onClick={() => openReturnModal(order)} style={{ padding: '10px 20px', background: '#0f172a', color: 'white', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                            Request Return
                          </button>
                        ) : (
                           <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                             Return not available ({order.orderStatus})
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      {/* Return Modal */}
      <AnimatePresence>
        {showReturnModal && selectedOrder && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReturnModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={{ background: 'white', borderRadius: 24, width: '100%', maxWidth: 700, position: 'relative', padding: 32, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>Request Return</h2>
                <button onClick={() => setShowReturnModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <PackageX size={24} />
                </button>
              </div>

              {/* Return Policy */}
              <div style={{ background: '#f8fafc', borderLeft: '4px solid #3b82f6', padding: 16, borderRadius: 12, marginBottom: 32 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Return Policy</h4>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                  <li>Returns available within 30 days after delivery.</li>
                  <li>Product must be unused / in acceptable condition.</li>
                  <li>Refund will be credited to your account balance after inspection.</li>
                </ul>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Select Items to Return</h3>
                {returnItems.map(item => (
                  <div key={item.saleItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>Purchased: {item.purchasedQty} @ \${parseFloat(item.price).toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Return Qty:</span>
                      <input 
                        type="number" 
                        min="0" 
                        max={item.purchasedQty} 
                        value={item.returnQty}
                        onChange={(e) => handleQuantityChange(item.saleItemId, parseInt(e.target.value) || 0, item.purchasedQty)}
                        style={{ width: 60, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 800 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Return Reason *</label>
                <select value={returnReason} onChange={e => setReturnReason(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', fontWeight: 600 }}>
                  <option value="">Select a reason...</option>
                  <option value="Damaged product">Damaged product</option>
                  <option value="Wrong product received">Wrong product received</option>
                  <option value="Defective product">Defective product</option>
                  <option value="Product not as described">Product not as described</option>
                  <option value="Missing item">Missing item</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Additional Comments (Optional)</label>
                <textarea 
                  value={customerNotes}
                  onChange={e => setCustomerNotes(e.target.value)}
                  placeholder="Tell us more about the issue..."
                  style={{ width: '100%', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', minHeight: 100, outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
                <button onClick={() => setShowReturnModal(false)} style={{ padding: '12px 24px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                <button onClick={submitReturn} disabled={loading} style={{ padding: '12px 24px', background: '#0f172a', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>
                  {loading ? 'Submitting...' : 'Submit Return'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerOrders;
`;

fs.writeFileSync('src/pages/CustomerOrders.jsx', content.slice(0, mainReturnIdx) + validJSX);
console.log('Fixed');

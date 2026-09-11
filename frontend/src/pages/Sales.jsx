import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  ShoppingCart, Package, Plus, Trash, CreditCard, Banknote, Search, 
  ArrowRight, X, Printer, Minus, User, Wifi, WifiOff, History, Layers, Tags, ArrowLeft, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { salesAPI, inventoryAPI, customerAPI } from '../api';

const DB_NAME = 'erp_offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending_sales';

const openDB = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = e => e.target.result.createObjectStore(STORE_NAME, { keyPath: 'localId', autoIncrement: true });
  req.onsuccess = e => resolve(e.target.result);
  req.onerror = () => reject(req.error);
});

const queueOfflineSale = async (saleData) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add({ ...saleData, queuedAt: Date.now() });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
};

const getPendingSales = async () => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
  });
};

const clearPendingSale = async (localId) => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(localId);
    tx.oncomplete = resolve;
  });
};

const ProductCard = React.memo(({ product, onAdd, cartQty }) => (
  <motion.div 
    whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onAdd(product)}
    style={{
      background: 'var(--bg-surface)', borderRadius: 16, padding: 20, cursor: 'pointer',
      border: '1px solid var(--border-main)', display: 'flex', flexDirection: 'column', gap: 12,
      opacity: product.stock <= 0 ? 0.6 : 1,
      pointerEvents: product.stock <= 0 ? 'none' : 'auto',
      transition: 'all 0.2s', position: 'relative'
    }}
  >
    {cartQty > 0 && (
      <div style={{ position: 'absolute', top: -10, right: -10, background: 'var(--theme-primary)', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        {cartQty}
      </div>
    )}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <Package size={22} />
      </div>
      <div style={{ background: product.stock < 10 ? '#fff1f2' : '#f0fdf4', color: product.stock < 10 ? '#e11d48' : '#16a34a', fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 8 }}>
        {product.stock <= 0 ? 'Out of Stock' : `${product.stock} in stock`}
      </div>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>{product.name}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{product.sku || 'No SKU'}</div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--theme-primary)' }}>${parseFloat(product.price).toFixed(2)}</div>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--theme-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <Plus size={18} strokeWidth={3} />
      </div>
    </div>
  </motion.div>
));

const Sales = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [step, setStep] = useState(1); // 1: Categories, 2: Products, 3: Payment
  
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);
  
  const [globalDiscount, setGlobalDiscount] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [cashTendered, setCashTendered] = useState('');
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  const searchRef = useRef();

  useEffect(() => {
    const onOnline = () => { setIsOnline(true); syncOfflineQueue(); };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    checkPendingCount();
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const checkPendingCount = async () => {
    const pending = await getPendingSales();
    setPendingCount(pending.length);
  };

  const syncOfflineQueue = async () => {
    const pending = await getPendingSales();
    if (!pending.length) return;
    for (const sale of pending) {
      try {
        const { localId, queuedAt, ...saleData } = sale;
        await salesAPI.createSale(saleData);
        await clearPendingSale(localId);
      } catch (e) { /* skip */ }
    }
    checkPendingCount();
  };

  useEffect(() => {
    const fetchProducts = () => inventoryAPI.getProducts().then(res => setProducts(res.data)).catch(() => {});
    fetchProducts();
    const interval = setInterval(fetchProducts, 30000);
    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.Category?.name || 'Uncategorized').filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
      const matchesCat = selectedCategory === 'All' || (p.Category?.name || 'Uncategorized') === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  useEffect(() => {
    if (!customerSearch.trim()) { setCustomerResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await customerAPI.search(customerSearch);
        setCustomerResults(res.data.slice(0, 5));
        setShowCustomerDropdown(true);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [customerSearch]);

  const selectCustomer = (c) => {
    setSelectedCustomer(c);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const addToCart = useCallback((product) => {
    if (product.stock <= 0) return alert("Out of stock!");
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: parseFloat(product.price), quantity: 1, stock: product.stock }];
    });
  }, []);

  const updateQty = useCallback((productId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return null;
      if (newQty > i.stock) return i;
      return { ...i, quantity: newQty };
    }).filter(Boolean));
  }, []);

  const removeFromCart = useCallback((productId) => setCart(prev => prev.filter(i => i.productId !== productId)), []);

  const cartTotalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const discountVal = parseFloat(globalDiscount || 0);
  const taxAmount = (subtotal - discountVal) * (parseFloat(taxRate || 0) / 100);
  const total = Math.max(subtotal - discountVal + taxAmount, 0);
  const changeDue = paymentMethod === 'cash' && cashTendered ? Math.max(parseFloat(cashTendered) - total, 0) : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    setProcessing(true);
    const saleData = {
      items: cart,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      totalAmount: subtotal,
      discount: discountVal,
      discountType: 'flat',
      tax: taxAmount,
      grandTotal: total,
      paymentMethod,
      cashAmount: paymentMethod === 'cash' ? total : 0,
      cardAmount: paymentMethod === 'card' ? total : 0,
      cashierName: currentUser.name || 'Staff'
    };

    try {
      if (!isOnline) {
        await queueOfflineSale(saleData);
        checkPendingCount();
        setReceipt({ ...saleData, id: 'OFFLINE-' + Date.now(), createdAt: new Date().toISOString(), offline: true, changeDue, cashTendered: cashTendered || total });
      } else {
        const res = await salesAPI.createSale(saleData);
        setReceipt({ ...res.data, items: cart, changeDue, cashTendered: cashTendered || total, cashierName: currentUser.name || 'Staff' });
      }
      setCart([]);
      setSelectedCustomer(null);
      setGlobalDiscount('');
      setCashTendered('');
      setPaymentMethod('cash');
      setStep(1); // Reset to first step
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  // --------------------------------------------------------
  // STEPS RENDERERS
  // --------------------------------------------------------

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ padding: '40px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 12px 0' }}>Step 1: Select Category</h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Choose a product category to begin</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 24 }}>
        {categories.map(cat => (
          <motion.button
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            key={cat}
            onClick={() => { setSelectedCategory(cat); setStep(2); }}
            style={{
              background: 'var(--bg-surface)', padding: '40px 24px', borderRadius: 24, border: '1px solid var(--border-main)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--theme-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {cat === 'All' ? <Layers size={32} /> : <Tags size={32} />}
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>{cat}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ padding: '40px', maxWidth: 1200, margin: '0 auto', width: '100%', paddingBottom: 120 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: 'var(--theme-primary)', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: 0, marginBottom: 12 }}>
            <ArrowLeft size={18} /> Back to Categories
          </button>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0' }}>Step 2: Add Products</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 15, margin: 0 }}>Category: <span style={{ color: 'var(--theme-primary)' }}>{selectedCategory}</span></p>
        </div>
        
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..." 
            style={{ width: 350, padding: '16px 16px 16px 48px', borderRadius: 20, border: '2px solid var(--border-main)', background: 'var(--bg-surface)', color: 'var(--text-main)', outline: 'none', fontWeight: 600, fontSize: 15 }}
          />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {filteredProducts.slice(0, 50).map(p => {
          const qtyInCart = cart.find(i => i.productId === p.id)?.quantity || 0;
          return <ProductCard key={p.id} product={p} onAdd={addToCart} cartQty={qtyInCart} />;
        })}
      </div>

      {cartTotalItems > 0 && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} style={{ position: 'fixed', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 50, pointerEvents: 'none' }}>
          <button 
            onClick={() => setStep(3)}
            style={{ pointerEvents: 'auto', background: 'var(--text-main)', color: 'var(--bg-body)', padding: '20px 40px', borderRadius: 100, border: 'none', display: 'flex', alignItems: 'center', gap: 16, fontSize: 18, fontWeight: 900, cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
          >
            <div style={{ background: 'var(--theme-primary)', color: 'white', padding: '4px 12px', borderRadius: 20 }}>{cartTotalItems} items</div>
            Proceed to Payment (${subtotal.toFixed(2)}) <ArrowRight size={20} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} style={{ padding: '40px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
      <button onClick={() => setStep(2)} style={{ background: 'transparent', border: 'none', color: 'var(--theme-primary)', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: 0, marginBottom: 24 }}>
        <ArrowLeft size={18} /> Back to Products
      </button>
      
      <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 32px 0', textAlign: 'center' }}>Step 3: Payment & Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40 }}>
        {/* Left Side: Cart & Customer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Customer */}
          <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 24, border: '1px solid var(--border-main)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 16px 0' }}>Assign Customer (Optional)</h3>
            <div style={{ position: 'relative' }}>
              {selectedCustomer ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-hover)', borderRadius: 16, border: '2px solid var(--theme-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--theme-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} /></div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-main)' }}>{selectedCustomer.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--theme-primary)', fontWeight: 700 }}>{selectedCustomer.phone || 'No phone'}</div>
                    </div>
                  </div>
                  <button onClick={clearCustomer} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-hover)', borderRadius: 16, border: '1px solid var(--border-main)', padding: '0 16px' }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                      value={customerSearch}
                      onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                      placeholder="Search name or phone..."
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '16px 12px', fontSize: 15, fontWeight: 600, color: 'var(--text-main)' }}
                    />
                  </div>
                  <AnimatePresence>
                    {showCustomerDropdown && customerResults.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 100, marginTop: 8, overflow: 'hidden' }}>
                        {customerResults.map(c => (
                          <div key={c.id} onClick={() => selectCustomer(c)} style={{ padding: '16px 20px', cursor: 'pointer', borderBottom: '1px solid var(--bg-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>{c.name}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{c.phone}</div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>

          {/* Cart Table */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid var(--border-main)', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Review Order</h3>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--theme-primary)', background: 'var(--bg-hover)', padding: '6px 12px', borderRadius: 20 }}>{cartTotalItems} items</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 350 }}>
              {cart.map(item => (
                <div key={item.productId} style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-main)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--theme-primary)', fontWeight: 800 }}>${item.price.toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-hover)', borderRadius: 12, padding: '4px' }}>
                    <button onClick={() => updateQty(item.productId, -1)} style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><Minus size={16} /></button>
                    <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-main)', minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, 1)} style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><Plus size={16} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} style={{ marginLeft: 20, border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><Trash size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Totals & Payments */}
        <div style={{ background: 'var(--bg-surface)', padding: 32, borderRadius: 24, border: '1px solid var(--border-main)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 24px 0' }}>Payment Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 15 }}>Subtotal</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 900, fontSize: 16 }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 15 }}>Discount ($)</span>
              <input type="number" min="0" value={globalDiscount} onChange={e => setGlobalDiscount(e.target.value)} 
                style={{ width: 100, padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border-main)', background: 'var(--bg-hover)', color: 'var(--text-main)', textAlign: 'right', fontWeight: 800, fontSize: 15 }} placeholder="0.00" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 15 }}>Tax (%)</span>
              <input type="number" min="0" value={taxRate} onChange={e => setTaxRate(e.target.value)} 
                style={{ width: 100, padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border-main)', background: 'var(--bg-hover)', color: 'var(--text-main)', textAlign: 'right', fontWeight: 800, fontSize: 15 }} placeholder="0" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 20, borderTop: '2px dashed var(--border-main)' }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)' }}>Grand Total</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--theme-primary)' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-muted)', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: 1 }}>Select Method</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <button onClick={() => setPaymentMethod('cash')} style={{ padding: '20px', borderRadius: 16, border: '2px solid', borderColor: paymentMethod === 'cash' ? 'var(--theme-primary)' : 'var(--border-main)', background: paymentMethod === 'cash' ? 'var(--theme-primary)' : 'var(--bg-surface)', color: paymentMethod === 'cash' ? 'white' : 'var(--text-main)', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'all 0.2s' }}>
              <Banknote size={24} /> Cash
            </button>
            <button onClick={() => setPaymentMethod('card')} style={{ padding: '20px', borderRadius: 16, border: '2px solid', borderColor: paymentMethod === 'card' ? 'var(--theme-primary)' : 'var(--border-main)', background: paymentMethod === 'card' ? 'var(--theme-primary)' : 'var(--bg-surface)', color: paymentMethod === 'card' ? 'white' : 'var(--text-main)', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'all 0.2s' }}>
              <CreditCard size={24} /> Card
            </button>
          </div>

          {paymentMethod === 'cash' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: 'var(--bg-hover)', padding: 16, borderRadius: 16, border: '1px solid var(--border-main)' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: 15 }}>Tendered ($)</span>
              <input type="number" min="0" value={cashTendered} onChange={e => setCashTendered(e.target.value)} 
                style={{ width: 120, padding: '12px', borderRadius: 12, border: '2px solid var(--theme-primary)', background: 'var(--bg-surface)', color: 'var(--text-main)', textAlign: 'right', fontWeight: 900, fontSize: 16 }} placeholder="0.00" />
            </div>
          )}

          <div style={{ marginTop: 'auto' }}>
            <button 
              disabled={processing || cart.length === 0}
              onClick={handleCheckout}
              style={{ width: '100%', padding: '20px', borderRadius: 16, background: 'var(--text-main)', color: 'var(--bg-body)',
                fontSize: 18, fontWeight: 900, border: 'none', cursor: 'pointer', opacity: (processing || cart.length === 0) ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              {processing ? 'Processing...' : `Complete Payment`} <CheckCircle size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{ height: '100vh', background: 'var(--bg-body)', overflowY: 'auto' }}>
      
      {/* Top Header Stepper */}
      <div style={{ position: 'sticky', top: 0, background: 'var(--bg-surface)', padding: '20px 40px', borderBottom: '1px solid var(--border-main)', display: 'flex', justifyContent: 'center', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 800, width: '100%' }}>
          {[1, 2, 3].map((s, idx) => (
            <React.Fragment key={s}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: step === s ? 1 : (step > s ? 0.7 : 0.3), cursor: step >= s ? 'pointer' : 'default' }}
                onClick={() => { if(step >= s) setStep(s); }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= s ? 'var(--theme-primary)' : 'var(--bg-hover)', color: step >= s ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>
                  {step > s ? <CheckCircle size={16} /> : s}
                </div>
                <span style={{ fontWeight: 800, fontSize: 15, color: step >= s ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {s === 1 ? 'Category' : s === 2 ? 'Products' : 'Payment'}
                </span>
              </div>
              {idx < 2 && <div style={{ flex: 1, height: 2, background: step > s ? 'var(--theme-primary)' : 'var(--bg-hover)' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </AnimatePresence>

      {/* Receipt Modal */}
      {receipt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
            style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: 420, padding: 32, borderRadius: 24, maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div id="printable-invoice" style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Receipt</h2>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, margin: '4px 0 0 0' }}>{new Date(receipt.createdAt).toLocaleString()}</p>
              </div>
              
              <div style={{ borderTop: '2px dashed var(--border-main)', borderBottom: '2px dashed var(--border-main)', padding: '16px 0', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {receipt.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{item.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{item.quantity} x ${parseFloat(item.price || 0).toFixed(2)}</div>
                    </div>
                    <div style={{ fontWeight: 900, color: 'var(--text-main)' }}>${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
                  <span>Subtotal</span><span>${parseFloat(receipt.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: 'var(--text-main)', fontWeight: 900, marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--border-main)' }}>
                  <span>Grand Total</span><span>${parseFloat(receipt.grandTotal || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setReceipt(null)} style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'var(--theme-primary)', color: 'white', border: 'none', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}>
              Done
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Sales;

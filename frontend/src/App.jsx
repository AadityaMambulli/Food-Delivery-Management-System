import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const API = '/api';
const navigation = [
  ['Dashboard', 'Overview'],
  ['Customers', 'People'],
  ['Restaurants', 'Places'],
  ['Menu Items', 'Food'],
  ['Orders', 'Orders'],
  ['Search & Filters', 'Search'],
  ['Reports', 'Reports'],
];

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || `Request failed (${response.status})`);
  return result;
}

function idOf(value) {
  if (!value) return '';
  return typeof value === 'object' ? value._id : value;
}

function money(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function date(value) {
  return value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

function display(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') {
    if (value.name) return value.name;
    if (value.addressLine) return `${value.addressLine}, ${value.city || ''}`;
    return value._id || JSON.stringify(value);
  }
  return String(value);
}

function App() {
  const [page, setPage] = useState('Dashboard');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState(null);

  useEffect(() => {
    request('/health').then(setHealth).catch((failure) => setError(failure.message));
  }, []);

  const run = useCallback(async (action) => {
    setError('');
    setNotice('');
    try {
      return await action();
    } catch (failure) {
      setError(failure.message);
      return null;
    }
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" onClick={() => setPage('Dashboard')}>
          <span className="brand-icon">FD</span>
          <span><strong>FoodDash</strong><small>Management system</small></span>
        </a>
        <p className="nav-label">WORKSPACE</p>
        <nav>
          {navigation.map(([label, icon]) => (
            <button className={`nav-link ${page === label ? 'active' : ''}`} key={label} onClick={() => { setPage(label); setError(''); setNotice(''); }}>
              <span className="nav-icon">{icon.slice(0, 1)}</span>{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className={`connection-dot ${health?.database?.status === 'connected' ? 'online' : ''}`} />
          <span>{health?.database?.status === 'connected' ? 'MongoDB connected' : 'Checking database…'}</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div><span className="eyebrow">FOOD DELIVERY MANAGEMENT</span><h1>{page}</h1></div>
          <div className="topbar-meta"><span className="live-pill"><i /> Local demo</span><span className="avatar">FD</span></div>
        </header>
        <div className="page-content">
          {error && <div className="alert error" role="alert">{error}<button onClick={() => setError('')}>Dismiss</button></div>}
          {notice && <div className="alert success" role="status">{notice}<button onClick={() => setNotice('')}>Dismiss</button></div>}
          {page === 'Dashboard' && <Dashboard run={run} />}
          {page === 'Customers' && <ResourcePage key={page} resource="customers" title="Customer directory" description="Manage customer profiles and membership." run={run} setNotice={setNotice} />}
          {page === 'Restaurants' && <ResourcePage key={page} resource="restaurants" title="Restaurant partners" description="Search and manage local restaurant listings." run={run} setNotice={setNotice} />}
          {page === 'Menu Items' && <ResourcePage key={page} resource="menu-items" title="Menu catalogue" description="Update food, pricing, dietary tags, and availability." run={run} setNotice={setNotice} />}
          {page === 'Orders' && <ResourcePage key={page} resource="orders" title="Order management" description="Track customer orders and update their status." run={run} setNotice={setNotice} />}
          {page === 'Search & Filters' && <SearchPage run={run} />}
          {page === 'Reports' && <Reports run={run} />}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ run }) {
  const [stats, setStats] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [summary, setSummary] = useState([]);
  const load = useCallback(() => run(async () => {
    const [overview, top, restaurants] = await Promise.all([
      request('/dashboard'), request('/reports/top-menu-items'), request('/restaurants/summary'),
    ]);
    setStats(overview.data);
    setTopItems(top.data);
    setSummary(restaurants.data.slice(0, 4));
  }), [run]);

  useEffect(() => { load(); }, [load]);

  const metrics = [
    ['Total customers', stats?.customers, '👥', 'lavender'],
    ['Restaurants', stats?.restaurants, '⌂', 'peach'],
    ['Menu items', stats?.menuItems, '✳', 'mint'],
    ['Total orders', stats?.orders, '▤', 'sky'],
    ['Delivered orders', stats?.deliveredOrders, '✓', 'mint'],
    ['Delivered revenue', stats ? money(stats.totalRevenue) : null, '₹', 'peach'],
  ];

  return (
    <>
      <section className="welcome-card">
        <div><span className="welcome-tag">YOUR LOCAL FOOD ECOSYSTEM</span><h2>Good evening, Admin <span>✦</span></h2><p>One place to explore orders, partners, and MongoDB insights.</p></div>
        <div className="welcome-illustration" aria-hidden="true">🍱</div>
      </section>
      <div className="section-heading"><div><h2>At a glance</h2><p>Live totals from your local database</p></div><button className="button secondary" onClick={load}>↻ Refresh</button></div>
      <section className="metric-grid">
        {metrics.map(([label, value, icon, color]) => <article className="metric-card" key={label}><span className={`metric-icon ${color}`}>{icon}</span><span className="metric-label">{label}</span><strong>{value ?? '…'}</strong><small>Updated from MongoDB</small></article>)}
      </section>
      <div className="two-column">
        <section className="panel"><div className="panel-heading"><div><h2>Popular dishes</h2><p>Top-selling from embedded order items</p></div><span className="subtle-tag">TOP 10</span></div><DataTable columns={[['name', 'Menu item'], ['quantitySold', 'Sold'], ['revenue', 'Revenue', money]]} rows={topItems.slice(0, 5)} /></section>
        <section className="panel"><div className="panel-heading"><div><h2>Restaurant snapshot</h2><p>Projected partner summary</p></div><span className="subtle-tag">RATED</span></div><DataTable columns={[['name', 'Restaurant'], ['cuisine', 'Cuisine'], ['rating', 'Rating', (value) => `★ ${value}`]]} rows={summary} /></section>
      </div>
    </>
  );
}

const fieldsByResource = {
  customers: [
    { name: 'name', label: 'Full name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', required: true },
    { name: 'age', label: 'Age', type: 'number' },
    { name: 'membershipLevel', label: 'Membership', type: 'select', options: ['Regular', 'Silver', 'Gold', 'Platinum'] },
    { name: 'isActive', label: 'Active', type: 'select', options: ['true', 'false'] },
  ],
  restaurants: [
    { name: 'name', label: 'Restaurant name', required: true },
    { name: 'cuisine', label: 'Cuisine', required: true },
    { name: 'categoryId', label: 'Category', source: 'restaurant-categories', required: true },
    { name: 'rating', label: 'Rating', type: 'number', step: '0.1' },
    { name: 'deliveryTime', label: 'Delivery minutes', type: 'number' },
    { name: 'minimumOrder', label: 'Minimum order (₹)', type: 'number' },
    { name: 'isOpen', label: 'Open', type: 'select', options: ['true', 'false'] },
    { name: 'addressLine', label: 'Street address' },
    { name: 'city', label: 'City', required: true },
    { name: 'pincode', label: 'Pincode' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
  'menu-items': [
    { name: 'name', label: 'Food name', required: true },
    { name: 'restaurantId', label: 'Restaurant', source: 'restaurants', required: true },
    { name: 'categoryId', label: 'Menu category', source: 'menu-categories', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'price', label: 'Price (₹)', type: 'number', required: true },
    { name: 'rating', label: 'Rating', type: 'number', step: '0.1' },
    { name: 'isAvailable', label: 'Available', type: 'select', options: ['true', 'false'] },
    { name: 'ingredients', label: 'Ingredients (comma separated)' },
    { name: 'tags', label: 'Tags (comma separated)' },
  ],
  orders: [
    { name: 'customerId', label: 'Customer', source: 'customers', required: true },
    { name: 'restaurantId', label: 'Restaurant', source: 'restaurants', required: true },
    { name: 'menuItemId', label: 'First menu item', source: 'menu-items', required: true },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'orderStatus', label: 'Order status', type: 'select', options: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'] },
    { name: 'paymentStatus', label: 'Payment status', type: 'select', options: ['Paid', 'Pending', 'Failed', 'Refunded'] },
  ],
};

function formFromRecord(resource, item) {
  if (!item) {
    const initial = {};
    for (const field of fieldsByResource[resource]) {
      initial[field.name] = field.type === 'select' ? (field.options?.[0] || '') : '';
    }
    if (resource === 'orders') initial.quantity = 1;
    return initial;
  }
  if (resource === 'customers') return { ...item, isActive: String(item.isActive) };
  if (resource === 'restaurants') return {
    ...item, categoryId: idOf(item.categoryId), isOpen: String(item.isOpen),
    addressLine: item.address?.addressLine || '', city: item.address?.city || 'Mumbai', pincode: item.address?.pincode || '',
  };
  if (resource === 'menu-items') return {
    ...item, restaurantId: idOf(item.restaurantId), categoryId: idOf(item.categoryId), isAvailable: String(item.isAvailable),
    ingredients: (item.ingredients || []).join(', '), tags: (item.tags || []).join(', '),
  };
  return { orderStatus: item.orderStatus, paymentStatus: item.paymentStatus };
}

function resourcePayload(resource, form) {
  const payload = { ...form };
  delete payload._id;
  delete payload.__v;
  delete payload.createdAt;
  delete payload.updatedAt;
  if (['customers', 'restaurants', 'menu-items'].includes(resource)) {
    for (const field of ['age', 'rating', 'deliveryTime', 'minimumOrder', 'price']) {
      if (payload[field] !== undefined && payload[field] !== '') payload[field] = Number(payload[field]);
    }
    for (const field of ['isActive', 'isOpen', 'isAvailable']) {
      if (payload[field] !== undefined) payload[field] = payload[field] === 'true';
    }
  }
  if (resource === 'restaurants') {
    payload.address = { addressLine: payload.addressLine || 'Mumbai', city: payload.city || 'Mumbai', pincode: payload.pincode || '400001' };
    delete payload.addressLine; delete payload.city; delete payload.pincode;
  }
  if (resource === 'menu-items') {
    payload.ingredients = (payload.ingredients || '').split(',').map((value) => value.trim()).filter(Boolean);
    payload.tags = (payload.tags || '').split(',').map((value) => value.trim()).filter(Boolean);
  }
  return payload;
}

function ResourcePage({ resource, title, description, run, setNotice }) {
  const [rows, setRows] = useState([]);
  const [lookups, setLookups] = useState({ customers: [], restaurants: [], 'restaurant-categories': [], 'menu-categories': [], menuItems: [] });
  const [form, setForm] = useState(() => formFromRecord(resource, null));
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);
  const [cuisines, setCuisines] = useState([]);

  const load = useCallback(() => run(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ limit: String(limit) });
      for (const [key, value] of Object.entries(filters)) if (value !== '' && value !== undefined) query.set(key, value);
      let path = `/${resource}?${query}`;
      if (resource === 'restaurants' && filters.search) {
        query.set('q', filters.search);
        query.delete('search');
        path = `/search/restaurants?${query}`;
      }
      const result = await request(path);
      setRows(result.data || []);
      return result;
    } finally {
      setLoading(false);
    }
  }), [filters, limit, resource, run]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (resource === 'customers') return;
    run(async () => {
      const [restaurantResult, restaurantCategoryResult, menuCategoryResult, menuResult, customerResult] = await Promise.all([
        request('/restaurants?limit=100'),
        request('/restaurant-categories?limit=100'),
        request('/menu-categories?limit=100'),
        request('/menu-items?limit=100'),
        request('/customers?limit=100'),
      ]);
      setLookups({
        customers: customerResult.data,
        restaurants: restaurantResult.data,
        'restaurant-categories': restaurantCategoryResult.data,
        'menu-categories': menuCategoryResult.data,
        menuItems: menuResult.data,
      });
      setCuisines([...new Set(restaurantResult.data.map((item) => item.cuisine))]);
    });
  }, [resource, run]);

  const columns = useMemo(() => {
    if (resource === 'customers') return [['name', 'Customer'], ['email', 'Email'], ['phone', 'Phone'], ['membershipLevel', 'Member'], ['isActive', 'Active']];
    if (resource === 'restaurants') return [['name', 'Restaurant'], ['cuisine', 'Cuisine'], ['rating', 'Rating', (value) => `★ ${value}`], ['deliveryTime', 'Delivery'], ['minimumOrder', 'Min. order', money], ['isOpen', 'Open']];
    if (resource === 'menu-items') return [['name', 'Food'], ['restaurantId', 'Restaurant'], ['categoryId', 'Category'], ['price', 'Price', money], ['rating', 'Rating', (value) => `★ ${value}`], ['isAvailable', 'Available']];
    return [['customerId', 'Customer'], ['restaurantId', 'Restaurant'], ['totalAmount', 'Amount', money], ['paymentStatus', 'Payment'], ['orderStatus', 'Status'], ['createdAt', 'Date', date]];
  }, [resource]);

  async function save(event) {
    event.preventDefault();
    await run(async () => {
      const payload = resource === 'orders' ? orderPayload(form, lookups, editing) : resourcePayload(resource, form);
      await request(`/${resource}${editing ? `/${editing._id}` : ''}`, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setNotice(editing ? 'Record updated successfully.' : 'Record created successfully.');
      setEditing(null);
      setForm(formFromRecord(resource, null));
      await load();
    });
  }

  async function remove(item) {
    if (!window.confirm(`Delete this ${resource.replace('-', ' ').replace(/s$/, '')} record?`)) return;
    await run(async () => {
      await request(`/${resource}/${item._id}`, { method: 'DELETE' });
      setNotice('Record deleted successfully.');
      await load();
    });
  }

  const canEdit = ['customers', 'restaurants', 'menu-items', 'orders'].includes(resource);

  return (
    <>
      <div className="section-heading"><div><h2>{title}</h2><p>{description}</p></div><span className="count-tag">{rows.length} records</span></div>
      {resource !== 'customers' && <div className="filter-strip">
        {resource === 'restaurants' && <><input placeholder="Search restaurants" value={filters.search || ''} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /><select value={filters.cuisine || ''} onChange={(event) => setFilters({ ...filters, cuisine: event.target.value })}><option value="">All cuisines</option>{cuisines.map((item) => <option key={item}>{item}</option>)}</select><select value={filters.minRating || ''} onChange={(event) => setFilters({ ...filters, minRating: event.target.value })}><option value="">Any rating</option><option value="4">4+ stars</option><option value="4.5">4.5+ stars</option></select><select value={filters.isOpen || ''} onChange={(event) => setFilters({ ...filters, isOpen: event.target.value })}><option value="">Any status</option><option value="true">Open</option><option value="false">Closed</option></select></>}
        {resource === 'menu-items' && <><input placeholder="Search food" value={filters.search || ''} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /><input type="number" placeholder="Min ₹" value={filters.minPrice || ''} onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })} /><input type="number" placeholder="Max ₹" value={filters.maxPrice || ''} onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })} /><select value={filters.available || ''} onChange={(event) => setFilters({ ...filters, available: event.target.value })}><option value="">Any availability</option><option value="true">Available</option><option value="false">Unavailable</option></select></>}
        {resource === 'orders' && <><select value={filters.status || ''} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All statuses</option>{['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((item) => <option key={item}>{item}</option>)}</select><select value={filters.paymentStatus || ''} onChange={(event) => setFilters({ ...filters, paymentStatus: event.target.value })}><option value="">Any payment</option>{['Paid', 'Pending', 'Failed', 'Refunded'].map((item) => <option key={item}>{item}</option>)}</select><input type="number" placeholder="Min amount" value={filters.minAmount || ''} onChange={(event) => setFilters({ ...filters, minAmount: event.target.value })} /><input type="number" placeholder="Max amount" value={filters.maxAmount || ''} onChange={(event) => setFilters({ ...filters, maxAmount: event.target.value })} /><input aria-label="Order date from" type="date" value={filters.from || ''} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /><input aria-label="Order date to" type="date" value={filters.to || ''} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></>}
        <label className="limit-control">Limit <select value={limit} onChange={(event) => setLimit(Number(event.target.value))}><option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option></select></label>
        <button className="button secondary" onClick={load}>Apply</button>
      </div>}
      {canEdit && <section className="panel form-panel">
        <div className="panel-heading"><div><h2>{editing ? 'Edit record' : `Add ${resource === 'menu-items' ? 'menu item' : resource.replace(/s$/, '').replace('-', ' ')}`}</h2><p>{editing ? 'Save changes to this record.' : 'Required fields are marked in the form.'}</p></div>{editing && <button className="button secondary" onClick={() => { setEditing(null); setForm(formFromRecord(resource, null)); }}>Cancel edit</button>}</div>
        <form className="data-form" onSubmit={save}>
          {fieldsByResource[resource].filter((field) => resource !== 'orders' || !editing || ['orderStatus', 'paymentStatus'].includes(field.name)).map((field) => <FormField key={field.name} field={field} value={form[field.name] ?? ''} options={field.source ? sourceOptions(field.source, lookups) : null} onChange={(value) => setForm({ ...form, [field.name]: value })} />)}
          <button className="button primary" type="submit">{editing ? 'Save changes' : 'Create record'}</button>
        </form>
      </section>}
      <section className="panel table-panel"><div className="panel-heading"><div><h2>Records</h2><p>{loading ? 'Loading from MongoDB…' : `${rows.length} result${rows.length === 1 ? '' : 's'}`}</p></div><button className="button ghost" onClick={load}>↻ Refresh</button></div><DataTable columns={columns} rows={rows} loading={loading} actions={canEdit ? (row) => <div className="row-actions"><button className="text-button" onClick={() => { setEditing(row); setForm(formFromRecord(resource, row)); }}>Edit</button><button className="text-button danger-text" onClick={() => remove(row)}>Delete</button></div> : null} /></section>
    </>
  );
}

function orderPayload(form, lookups, editing) {
  if (editing) return { orderStatus: form.orderStatus, paymentStatus: form.paymentStatus };
  const customer = lookups.customers.find((item) => item._id === form.customerId);
  const restaurant = lookups.restaurants.find((item) => item._id === form.restaurantId);
  const menuItem = lookups.menuItems.find((item) => item._id === form.menuItemId);
  if (!customer || !restaurant || !menuItem) throw new Error('Choose a valid customer, restaurant, and menu item.');
  if (menuItem.restaurantId?._id !== restaurant._id && menuItem.restaurantId !== restaurant._id) throw new Error('Choose a menu item belonging to the selected restaurant.');
  const quantity = Math.max(1, Number(form.quantity || 1));
  const subtotal = menuItem.price * quantity;
  return {
    customerId: customer._id,
    restaurantId: restaurant._id,
    items: [{ menuItemId: menuItem._id, name: menuItem.name, quantity, price: menuItem.price, subtotal }],
    subtotal,
    deliveryFee: 35,
    discount: 0,
    totalAmount: subtotal + 35,
    orderStatus: form.orderStatus || 'Pending',
    paymentStatus: form.paymentStatus || 'Pending',
    deliveryAddress: { addressLine: 'Demo delivery address', city: restaurant.address?.city || 'Mumbai', pincode: restaurant.address?.pincode || '400001' },
  };
}

function sourceOptions(source, lookups) {
  if (source === 'restaurants') return lookups.restaurants;
  if (source === 'customers') return lookups.customers;
  if (source === 'menu-items') return lookups.menuItems;
  return lookups[source] || [];
}

function FormField({ field, value, onChange, options }) {
  const inputProps = {
    id: field.name,
    required: field.required,
    value,
    onChange: (event) => onChange(event.target.value),
  };
  return <label className={`form-field ${field.type === 'textarea' ? 'wide' : ''}`} htmlFor={field.name}><span>{field.label}</span>
    {options ? <select {...inputProps}><option value="">Choose…</option>{options.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select>
      : field.type === 'select' ? <select {...inputProps}>{field.options.map((item) => <option key={item} value={item}>{item === 'true' ? 'Yes' : item === 'false' ? 'No' : item}</option>)}</select>
        : field.type === 'textarea' ? <textarea {...inputProps} rows="2" />
          : <input {...inputProps} type={field.type || 'text'} min={field.type === 'number' ? '0' : undefined} step={field.step} />}</label>;
}

function DataTable({ columns, rows, loading, actions }) {
  if (loading) return <div className="empty-state"><span className="spinner" /> Loading records…</div>;
  if (!rows?.length) return <div className="empty-state"><span className="empty-icon">⌕</span><strong>No records found</strong><span>Try adjusting your filters or add a record.</span></div>;
  return <div className="table-scroll"><table><thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}{actions && <th>Actions</th>}</tr></thead><tbody>{rows.map((row, index) => <tr key={row._id || columns.map(([key]) => String(row[key] ?? '')).join('-') || index}>{columns.map(([key, label, format]) => <td key={label}>{format ? format(row[key], row) : display(row[key])}</td>)}{actions && <td>{actions(row)}</td>}</tr>)}</tbody></table></div>;
}

function SearchPage({ run }) {
  const [restaurantTerm, setRestaurantTerm] = useState('');
  const [foodTerm, setFoodTerm] = useState('');
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', minRating: '', available: '', caloriesBelow: '', limit: '10' });
  const [restaurantResults, setRestaurantResults] = useState([]);
  const [foodResults, setFoodResults] = useState([]);
  const [examples, setExamples] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [orders, setOrders] = useState([]);

  async function searchRestaurants(event) {
    event.preventDefault();
    await run(async () => setRestaurantResults((await request(`/search/restaurants?q=${encodeURIComponent(restaurantTerm)}`)).data));
  }
  async function searchFood(event) {
    event.preventDefault();
    await run(async () => setFoodResults((await request(`/search/menu-items?q=${encodeURIComponent(foodTerm)}&limit=${filters.limit}`)).data));
  }
  async function applyFilters(event) {
    event.preventDefault();
    await run(async () => {
      const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== ''));
      setFoodResults((await request(`/menu-items/filter?${query}`)).data);
    });
  }
  async function loadExamples(kind) {
    await run(async () => {
      setExamples({ kind, result: await request(`/queries/${kind}`) });
    });
  }
  async function searchOrders(event) {
    event.preventDefault();
    await run(async () => {
      const query = new URLSearchParams({ limit: filters.limit });
      if (orderStatus) query.set('status', orderStatus);
      setOrders((await request(`/orders?${query}`)).data);
    });
  }

  return <>
    <div className="section-heading"><div><h2>Find the right result</h2><p>Run text search and safe, parameter-based MongoDB filters.</p></div></div>
    <div className="search-grid">
      <section className="panel search-panel"><span className="panel-kicker">TEXT INDEX · RESTAURANTS</span><h2>Restaurant search</h2><p>Search restaurant name, cuisine, and description.</p><form className="search-form" onSubmit={searchRestaurants}><input required placeholder="Try “biryani” or “Italian”" value={restaurantTerm} onChange={(event) => setRestaurantTerm(event.target.value)} /><button className="button primary">Search</button></form><DataTable columns={[['name', 'Restaurant'], ['cuisine', 'Cuisine'], ['rating', 'Rating', (value) => `★ ${value}`]]} rows={restaurantResults} /></section>
      <section className="panel search-panel"><span className="panel-kicker">MENU CATALOGUE</span><h2>Food search</h2><p>Search menu names, descriptions, and tags.</p><form className="search-form" onSubmit={searchFood}><input required placeholder="Try “paneer” or “dessert”" value={foodTerm} onChange={(event) => setFoodTerm(event.target.value)} /><button className="button primary">Search</button></form><DataTable columns={[['name', 'Food'], ['restaurantId', 'Restaurant'], ['price', 'Price', money]]} rows={foodResults.slice(0, 8)} /></section>
    </div>
    <section className="panel filter-panel"><div className="panel-heading"><div><span className="panel-kicker">COMPARISON + LOGICAL FILTERS</span><h2>Menu item filters</h2><p>Combines price bounds, rating, availability, and nested nutrition fields.</p></div><span className="operator-chip">$gte · $lte · $and · $or</span></div>
      <form className="filter-form" onSubmit={applyFilters}>
        <label>Minimum price<input type="number" min="0" value={filters.minPrice} onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })} /></label>
        <label>Maximum price<input type="number" min="0" value={filters.maxPrice} onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })} /></label>
        <label>Minimum rating<input type="number" min="0" max="5" step="0.1" value={filters.minRating} onChange={(event) => setFilters({ ...filters, minRating: event.target.value })} /></label>
        <label>Availability<select value={filters.available} onChange={(event) => setFilters({ ...filters, available: event.target.value })}><option value="">Any</option><option value="true">Available</option><option value="false">Unavailable</option></select></label>
        <label>Calories below<input type="number" min="0" value={filters.caloriesBelow} onChange={(event) => setFilters({ ...filters, caloriesBelow: event.target.value })} /></label>
        <label>Top results<select value={filters.limit} onChange={(event) => setFilters({ ...filters, limit: event.target.value })}><option>5</option><option>10</option><option>20</option><option>50</option></select></label>
        <button className="button primary">Apply filters</button>
      </form>
      <DataTable columns={[['name', 'Food'], ['price', 'Price', money], ['rating', 'Rating'], ['isAvailable', 'Available'], ['nutrition', 'Nutrition', (value) => `${value?.calories ?? '—'} kcal`]]} rows={foodResults} />
    </section>
    <section className="panel order-search"><div className="panel-heading"><div><span className="panel-kicker">ORDER STATUS FILTER</span><h2>Find orders by status</h2><p>Uses an indexed collection query and a visible result limit.</p></div></div><form className="search-form" onSubmit={searchOrders}><select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)}><option value="">All order statuses</option>{['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((item) => <option key={item}>{item}</option>)}</select><button className="button primary">Find orders</button></form><DataTable columns={[['customerId', 'Customer'], ['restaurantId', 'Restaurant'], ['orderStatus', 'Status'], ['totalAmount', 'Amount', money], ['createdAt', 'Date', date]]} rows={orders.slice(0, 10)} /></section>
    <section className="panel operations-panel"><div className="panel-heading"><div><span className="panel-kicker">QUERY EXAMPLES</span><h2>MongoDB operations</h2><p>Safe, read-only demonstrations of logical, comparison, array, and embedded queries.</p></div></div><div className="operation-buttons"><button className="operation-card" onClick={() => loadExamples('comparison')}><strong>Comparison filters</strong><code>$gt · $gte · $lt · $lte · $ne · $in · $nin</code></button><button className="operation-card" onClick={() => loadExamples('logical')}><strong>Logical filters</strong><code>$and · $or · $not</code></button><button className="operation-card" onClick={() => loadExamples('arrays')}><strong>Array handling</strong><code>$in · $all · array paths</code></button><button className="operation-card" onClick={() => loadExamples('embedded')}><strong>Embedded documents</strong><code>address.city · nutrition.calories</code></button><button className="operation-card" onClick={() => run(async () => { const response = await request('/indexes'); setExamples({ kind: 'Indexes', result: response }); })}><strong>Indexes</strong><code>email · order history · text</code></button></div>
      {examples && <pre className="json-output">{JSON.stringify(examples.result.data, null, 2)}</pre>}
    </section>
  </>;
}

function Reports({ run }) {
  const [reports, setReports] = useState({ revenue: [], spending: [], status: [] });
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => run(async () => {
    setLoading(true);
    try {
      const [revenue, spending, status] = await Promise.all([
        request('/reports/restaurant-revenue'), request('/reports/customer-spending'), request('/reports/order-status'),
      ]);
      setReports({ revenue: revenue.data, spending: spending.data, status: status.data });
    } finally {
      setLoading(false);
    }
  }), [run]);
  useEffect(() => { load(); }, [load]);

  return <>
    <div className="section-heading"><div><h2>MongoDB aggregation reports</h2><p>Live aggregation pipelines executed against seeded orders.</p></div><button className="button secondary" onClick={load}>↻ Refresh reports</button></div>
    <div className="report-grid">
      <section className="panel"><div className="panel-heading"><div><span className="panel-kicker">PIPELINE 01 · $MATCH → $GROUP</span><h2>Restaurant revenue</h2><p>Delivered orders grouped by restaurant.</p></div></div><DataTable loading={loading} columns={[['restaurant', 'Restaurant'], ['totalOrders', 'Orders'], ['totalRevenue', 'Revenue', money]]} rows={reports.revenue} /></section>
      <section className="panel"><div className="panel-heading"><div><span className="panel-kicker">PIPELINE 02 · CUSTOMER SPENDING</span><h2>Top customers</h2><p>Customer lifetime delivered spend.</p></div></div><DataTable loading={loading} columns={[['customer', 'Customer'], ['totalOrders', 'Orders'], ['totalSpent', 'Spent', money]]} rows={reports.spending.slice(0, 8)} /></section>
    </div>
    <section className="panel"><div className="panel-heading"><div><span className="panel-kicker">PIPELINE 03 · ORDER STATUS</span><h2>Order distribution</h2><p>Order count and order value per status.</p></div></div><DataTable loading={loading} columns={[['status', 'Status'], ['orderCount', 'Orders'], ['totalValue', 'Total value', money]]} rows={reports.status} /></section>
    <p className="aggregation-note"><strong>Pipeline stages used:</strong> <code>$match</code> · <code>$group</code> · <code>$sort</code> · <code>$project</code> · <code>$lookup</code></p>
  </>;
}

export default App;

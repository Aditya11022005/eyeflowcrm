import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Filter, AlertTriangle, AlertCircle, X } from 'lucide-react';
import api from '../utils/api.js';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [itemCategory, setItemCategory] = useState('frame');
  const [brand, setBrand] = useState('');
  const [supplier, setSupplier] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [error, setError] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/inventory?category=${category}&search=${search}`);
      if (res.data.success) {
        setInventory(res.data.inventory);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInventory();
    }, 450);
    return () => clearTimeout(delayDebounceFn);
  }, [category, search]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/inventory', {
        name,
        sku,
        category: itemCategory,
        brand,
        supplier,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        quantity: Number(quantity),
        minStockAlert: Number(minStockAlert),
      });

      if (res.data.success) {
        setShowAddModal(false);
        // Reset form
        setName('');
        setSku('');
        setItemCategory('frame');
        setBrand('');
        setSupplier('');
        setCostPrice('');
        setSellingPrice('');
        setQuantity('');
        setMinStockAlert('5');
        fetchInventory();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating inventory record.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Stock & Catalog</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track optical frames, lenses, contact stocks and alerts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors flex items-center gap-2 cursor-pointer text-xs"
        >
          <Plus className="w-4 h-4" />
          Add Catalog Product
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, SKU barcode, brand..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 outline-none focus:ring-2 focus:ring-clinic-500 text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 outline-none focus:ring-2 focus:ring-clinic-500 text-sm dark:text-white font-semibold"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="frame">Frames</option>
            <option value="lens">Lenses</option>
            <option value="contact-lens">Contact Lenses</option>
            <option value="solution">Solutions</option>
            <option value="accessory">Accessories</option>
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="w-8 h-8 border-4 border-clinic-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : inventory.length === 0 ? (
        <div className="p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 rounded-3xl">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Catalog is empty</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Onboard optical items or frames to track levels.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Product details</th>
                <th className="px-6 py-4">SKU / Code</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Cost Price</th>
                <th className="px-6 py-4 text-right">Retail Price</th>
                <th className="px-6 py-4 text-center">In Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {inventory.map((item) => {
                const isLow = item.quantity <= item.minStockAlert;
                return (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{item.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.brand || 'No Brand'}</p>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-600 dark:text-slate-400">{item.sku}</td>
                    <td className="px-6 py-4 capitalize">{item.category.replace(/-/g, ' ')}</td>
                    <td className="px-6 py-4 text-right font-medium">₹{item.costPrice}</td>
                    <td className="px-6 py-4 text-right font-bold text-clinic-600 dark:text-clinic-400">₹{item.sellingPrice}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${
                        isLow 
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 animate-pulse'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                      }`}>
                        {isLow && <AlertCircle className="w-3.5 h-3.5" />}
                        {item.quantity} units
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6">Onboard Stock Product</h3>

            {error && (
              <div className="mb-4 p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Ray-Ban Wayfarer"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">SKU / Barcode Code</label>
                  <input
                    type="text"
                    required
                    placeholder="RB-4105-01"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Category</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white dark:bg-darkbg-100"
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                  >
                    <option value="frame">Frame</option>
                    <option value="lens">Lens</option>
                    <option value="contact-lens">Contact Lens</option>
                    <option value="solution">Solution</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Brand</label>
                  <input
                    type="text"
                    placeholder="Ray-Ban"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Supplier</label>
                  <input
                    type="text"
                    placeholder="Luxottica Inc."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Cost Price</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Retail Price</label>
                  <input
                    type="number"
                    required
                    placeholder="4999"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Initial Qty</label>
                  <input
                    type="number"
                    required
                    placeholder="12"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Alert Level</label>
                  <input
                    type="number"
                    required
                    placeholder="3"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors text-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;

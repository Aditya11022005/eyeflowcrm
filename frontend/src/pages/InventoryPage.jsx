import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Package, Search, Plus, Filter, AlertTriangle, AlertCircle, X, Printer, Camera, Pencil, Trash2 } from 'lucide-react';
import api from '../utils/api.js';
import JsBarcode from 'jsbarcode';
import { Html5Qrcode } from 'html5-qrcode';
import { TableSkeleton } from '../components/SkeletonLoader.jsx';

const BarcodeRenderer = ({ value, name, brand, price }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width: 1.5,
          height: 35,
          displayValue: true,
          fontSize: 9,
          margin: 0,
        });
      } catch (err) {
        console.error('Barcode generation error:', err);
      }
    }
  }, [value]);

  return (
    <div className="border border-slate-200 dark:border-slate-800 p-3 rounded-xl bg-white text-black flex flex-col items-center justify-between text-center min-h-[110px] w-full print-label">
      <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight truncate max-w-full leading-tight">{name}</span>
      {brand && <span className="text-[8px] text-slate-400 font-bold uppercase leading-none mt-0.5">{brand}</span>}
      <svg ref={svgRef} className="max-w-full my-1.5"></svg>
      <span className="text-[9px] font-black text-slate-900 mt-0.5">₹{price}</span>
    </div>
  );
};

const BarcodeCameraScanner = ({ onScanSuccess, onClose }) => {
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const html5QrcodeRef = useRef(null);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(devices => {
        setCameras(devices);
        if (devices.length > 0) {
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('environment') || 
            device.label.toLowerCase().includes('rear')
          );
          const defaultCameraId = backCamera ? backCamera.id : devices[0].id;
          setActiveCameraId(defaultCameraId);
        } else {
          setError('No cameras found on this device.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Camera access error:', err);
        setError('Camera permission denied or camera not accessible.');
        setLoading(false);
      });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = (cameraId) => {
    if (!cameraId) return;
    
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      html5QrcodeRef.current.stop().then(() => {
        initScanner(cameraId);
      }).catch(err => console.error(err));
    } else {
      initScanner(cameraId);
    }
  };

  const initScanner = (cameraId) => {
    const html5Qrcode = new Html5Qrcode("reader");
    html5QrcodeRef.current = html5Qrcode;

    const config = {
      fps: 15,
      qrbox: (width, height) => {
        const boxWidth = Math.min(width * 0.8, 300);
        const boxHeight = Math.min(height * 0.4, 120);
        return { width: boxWidth, height: boxHeight };
      },
      aspectRatio: 1.777778
    };

    html5Qrcode.start(
      cameraId,
      config,
      (decodedText, decodedResult) => {
        playBeep();
        onScanSuccess(decodedText);
        stopScanning();
      },
      (errorMessage) => {
        // Silent error
      }
    ).catch(err => {
      console.error('Failed to start scanner:', err);
      setError('Could not initialize camera stream. Ensure camera is not used by another app.');
    });
  };

  const stopScanning = () => {
    if (html5QrcodeRef.current) {
      if (html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch(err => console.error(err));
      }
      html5QrcodeRef.current = null;
    }
  };

  useEffect(() => {
    if (activeCameraId) {
      startScanning(activeCameraId);
    }
  }, [activeCameraId]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (err) {
      console.warn('Audio beep error:', err);
    }
  };

  const switchCamera = (e) => {
    setActiveCameraId(e.target.value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4 no-print">
      <div className="w-full max-w-lg bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-clinic-500">
          <Camera className="w-5 h-5" />
          <h3 className="text-base font-black text-slate-850 dark:text-white">Camera Barcode Scanner</h3>
        </div>
        <p className="text-[11px] text-slate-400 mb-4">
          Position a product barcode inside the scanner laser rectangle.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold flex gap-2 items-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-video border border-slate-800 flex items-center justify-center mb-4">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white gap-2">
              <div className="w-6 h-6 border-2 border-clinic-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-bold text-slate-400">Accessing Camera...</span>
            </div>
          )}
          <div id="reader" className="w-full h-full"></div>
          {!loading && !error && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[70%] h-[40%] max-w-[300px] max-h-[120px] border-2 border-dashed border-clinic-400 rounded-xl relative shadow-[0_0_0_9999px_rgba(15,23,42,0.6)]">
                <div className="absolute left-2 right-2 top-1/2 h-[1.5px] bg-rose-500 animate-pulse shadow-md shadow-rose-500" />
              </div>
            </div>
          )}
        </div>

        {cameras.length > 1 && (
          <div className="mb-4">
            <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
              Select Camera Source
            </label>
            <select
              value={activeCameraId}
              onChange={switchCamera}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs dark:text-white dark:bg-darkbg-100 font-semibold"
            >
              {cameras.map(cam => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || `Camera ${cameras.indexOf(cam) + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Print & Selection States
  const [selectedItems, setSelectedItems] = useState([]);
  const [printQuantities, setPrintQuantities] = useState({});
  const [layoutColumns, setLayoutColumns] = useState(3);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const isOwner = user?.role === 'owner';

  // Edit/Delete States
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editItemCategory, setEditItemCategory] = useState('frame');
  const [editBrand, setEditBrand] = useState('');
  const [editSupplier, setEditSupplier] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editSellingPrice, setEditSellingPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editMinStockAlert, setEditMinStockAlert] = useState('5');
  const [editError, setEditError] = useState('');

  const [deletingItemId, setDeletingItemId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setEditName(item.name || '');
    setEditSku(item.sku || '');
    setEditItemCategory(item.category || 'frame');
    setEditBrand(item.brand || '');
    setEditSupplier(item.supplier || '');
    setEditCostPrice(String(item.costPrice || ''));
    setEditSellingPrice(String(item.sellingPrice || ''));
    setEditQuantity(String(item.quantity || ''));
    setEditMinStockAlert(String(item.minStockAlert || '5'));
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditItemSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setEditError('');
    try {
      const res = await api.put(`/inventory/${editingItem._id}`, {
        name: editName,
        sku: editSku,
        category: editItemCategory,
        brand: editBrand,
        supplier: editSupplier,
        costPrice: Number(editCostPrice),
        sellingPrice: Number(editSellingPrice),
        quantity: Number(editQuantity),
        minStockAlert: Number(editMinStockAlert),
      });

      if (res.data.success) {
        setShowEditModal(false);
        setEditingItem(null);
        fetchInventory();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Error updating product.');
    }
  };

  const handleDeleteItemSubmit = async () => {
    if (!deletingItemId) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/inventory/${deletingItemId}`);
      if (res.data.success) {
        setDeletingItemId(null);
        fetchInventory();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleSelectItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.some(i => i._id === item._id);
      if (exists) {
        return prev.filter(i => i._id !== item._id);
      } else {
        return [...prev, item];
      }
    });
  };

  const toggleSelectAll = () => {
    if (inventory.length > 0 && selectedItems.length === inventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...inventory]);
    }
  };

  const handleOpenSinglePrint = (item) => {
    setSelectedItems([item]);
    setPrintQuantities({ [item._id]: 1 });
    setShowPrintModal(true);
  };

  const handleOpenBulkPrint = () => {
    const initialQuantities = {};
    selectedItems.forEach(item => {
      initialQuantities[item._id] = item.quantity > 0 ? item.quantity : 1;
    });
    setPrintQuantities(initialQuantities);
    setShowPrintModal(true);
  };

  // Scan & Quick Stock Update States
  const [scannedValue, setScannedValue] = useState('');
  const [quickUpdateItem, setQuickUpdateItem] = useState(null);
  const [quickAddQty, setQuickAddQty] = useState('1');
  const [quickUpdateError, setQuickUpdateError] = useState('');
  const [quickUpdateLoading, setQuickUpdateLoading] = useState(false);
  const [onboardTip, setOnboardTip] = useState('');
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  const handleNewBarcodeScanned = (trimmedCode) => {
    const existingItem = inventory.find(
      (item) => item.sku.toLowerCase() === trimmedCode.toLowerCase()
    );

    if (existingItem) {
      setQuickUpdateItem(existingItem);
      setQuickAddQty('1');
      setQuickUpdateError('');
      setQuickUpdateLoading(false);
    } else {
      setSku(trimmedCode);
      setName('Loading details...');
      setItemCategory('frame');
      setBrand('');
      setSupplier('');
      setCostPrice('');
      setSellingPrice('');
      setQuantity('');
      setMinStockAlert('5');
      setOnboardTip(`✨ New barcode SKU detected: "${trimmedCode}". Fetching details...`);
      setError('');
      setShowAddModal(true);

      api.get(`/inventory/lookup/${trimmedCode}`)
        .then(res => {
          if (res.data.success && res.data.product) {
            const prod = res.data.product;
            setName(prod.name || '');
            setBrand(prod.brand || '');
            setItemCategory(prod.category || 'frame');
            if (prod.retailPrice) {
              setSellingPrice(String(prod.retailPrice));
              setCostPrice(String(Math.round(prod.retailPrice * 0.5)));
            }
            setOnboardTip(`✨ New barcode SKU detected: "${trimmedCode}". Details auto-filled from database!`);
          } else {
            setName('');
            setOnboardTip(`✨ New barcode SKU detected: "${trimmedCode}". Complete details manually.`);
          }
        })
        .catch(err => {
          console.warn('Barcode lookup failed:', err);
          setName('');
          setOnboardTip(`✨ New barcode SKU detected: "${trimmedCode}". Complete details manually.`);
        });
    }
  };

  const handleBarcodeScanSubmit = (e) => {
    e.preventDefault();
    if (!scannedValue.trim()) return;

    const trimmedCode = scannedValue.trim();
    setScannedValue('');
    handleNewBarcodeScanned(trimmedCode);
  };

  const handleCameraScanSuccess = (decodedText) => {
    setShowCameraScanner(false);
    if (!decodedText) return;

    const trimmedCode = decodedText.trim();
    handleNewBarcodeScanned(trimmedCode);
  };

  const handleQuickStockUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!quickUpdateItem) return;

    const qtyToAdd = Number(quickAddQty);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      setQuickUpdateError('Please enter a valid quantity greater than 0.');
      return;
    }

    setQuickUpdateLoading(true);
    setQuickUpdateError('');

    try {
      const newQty = quickUpdateItem.quantity + qtyToAdd;
      const res = await api.put(`/inventory/${quickUpdateItem._id}`, {
        quantity: newQty,
      });

      if (res.data.success) {
        setQuickUpdateItem(null);
        fetchInventory();
      }
    } catch (err) {
      setQuickUpdateError(err.response?.data?.message || 'Error updating stock quantity.');
    } finally {
      setQuickUpdateLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setSku('');
    setName('');
    setItemCategory('frame');
    setBrand('');
    setSupplier('');
    setCostPrice('');
    setSellingPrice('');
    setQuantity('');
    setMinStockAlert('5');
    setOnboardTip('');
    setError('');
    setShowAddModal(true);
  };

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

  // Listen for physical hardware barcode scanner gun (keyboard emulation)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      // Ignore key events if the user is typing inside standard input fields
      const targetTag = e.target.tagName.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }

      const currentTime = Date.now();
      
      // Hardware scanners simulate high-speed keystrokes (typically < 80ms gaps)
      if (currentTime - lastKeyTime > 100) {
        buffer = ''; // Reset buffer if there is a human-like delay
      }

      lastKeyTime = currentTime;

      // Append standard alphanumeric digits to buffer
      if (e.key.length === 1 && /[a-zA-Z0-9-]/.test(e.key)) {
        buffer += e.key;
      }

      // Scanner gun sends an 'Enter' keystroke at the end of the read sequence
      if (e.key === 'Enter' && buffer.length > 3) {
        const scannedCode = buffer;
        buffer = '';
        
        // Update state to trigger table search lookup
        setSearch(scannedCode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setSearch]);

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
        setOnboardTip('');
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
    <>
      <div className="space-y-6 no-print">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Stock & Catalog</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track optical frames, lenses, contact stocks and alerts</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors flex items-center gap-2 cursor-pointer text-xs"
        >
          <Plus className="w-4 h-4" />
          Add Catalog Product
        </button>
      </div>

      {/* Filter & Scan Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, SKU barcode, brand..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 outline-none focus:ring-2 focus:ring-clinic-500 text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <form onSubmit={handleBarcodeScanSubmit}>
            <Printer className="absolute left-4 top-3.5 w-4 h-4 text-clinic-500 animate-pulse" />
            <input
              type="text"
              placeholder="Scan barcode..."
              className="w-full pl-11 pr-12 py-3 rounded-2xl border border-clinic-250 dark:border-slate-800 bg-white dark:bg-darkbg-100 outline-none focus:ring-2 focus:ring-clinic-500 text-sm transition-all placeholder-clinic-400 font-bold"
              value={scannedValue}
              onChange={(e) => setScannedValue(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowCameraScanner(true)}
              className="absolute right-3 top-2.5 p-1.5 text-slate-400 hover:text-clinic-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
              title="Scan using Camera"
            >
              <Camera className="w-4 h-4" />
            </button>
          </form>
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
        <TableSkeleton rows={6} cols={7} />
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
                <th className="px-6 py-4 text-center w-12 no-print">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-clinic-500 focus:ring-clinic-500 cursor-pointer w-4 h-4"
                    checked={inventory.length > 0 && selectedItems.length === inventory.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4">Product details</th>
                <th className="px-6 py-4">SKU / Code</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Cost Price</th>
                <th className="px-6 py-4 text-right">Retail Price</th>
                <th className="px-6 py-4 text-center">In Stock</th>
                <th className="px-6 py-4 text-center w-24 no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {inventory.map((item) => {
                const isLow = item.quantity <= item.minStockAlert;
                return (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 text-center w-12 no-print">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-clinic-500 focus:ring-clinic-500 cursor-pointer w-4 h-4"
                        checked={selectedItems.some(i => i._id === item._id)}
                        onChange={() => toggleSelectItem(item)}
                      />
                    </td>
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
                    <td className="px-6 py-4 text-center w-24 no-print flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenSinglePrint(item)}
                        className="p-1.5 text-slate-500 hover:text-clinic-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                        title="Print Barcode"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-slate-500 hover:text-indigo-650 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                        title="Edit Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => setDeletingItemId(item._id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
              onClick={() => {
                setShowAddModal(false);
                setOnboardTip('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6">Onboard Stock Product</h3>

            {onboardTip && (
              <div className="mb-4 p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs font-semibold flex items-center justify-between">
                <span>{onboardTip}</span>
                <button 
                  type="button" 
                  onClick={() => setOnboardTip('')}
                  className="text-blue-400 hover:text-blue-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

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
                  onClick={() => {
                    setShowAddModal(false);
                    setOnboardTip('');
                  }}
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

      {/* Bulk Action Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-6 border border-slate-800 animate-slide-up no-print">
          <span className="text-xs font-bold">{selectedItems.length} products selected</span>
          <div className="flex gap-2">
            <button
              onClick={handleOpenBulkPrint}
              className="px-3.5 py-1.5 bg-clinic-500 hover:bg-clinic-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Barcodes
            </button>
            <button
              onClick={() => setSelectedItems([])}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Barcode Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-4xl bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Printer className="w-5 h-5 text-clinic-500" />
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Print SKU Barcodes</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">Configure sticker counts and column layout for printing.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden flex-1 mb-6">
              {/* Configuration panel */}
              <div className="md:col-span-1 border-r border-slate-100 dark:border-slate-800 pr-6 overflow-y-auto space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Sticker Grid Columns</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(cols => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => setLayoutColumns(cols)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          layoutColumns === cols
                            ? 'bg-clinic-500 border-clinic-500 text-white'
                            : 'border-slate-200 dark:border-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {cols} Col
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Stickers Copies</label>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                    {selectedItems.map(item => (
                      <div key={item._id} className="flex justify-between items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-850">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold truncate dark:text-slate-200">{item.name}</p>
                          <p className="text-[9px] font-mono text-slate-400">{item.sku}</p>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-center text-xs dark:text-white font-bold"
                          value={printQuantities[item._id] || 1}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value) || 1);
                            setPrintQuantities(prev => ({ ...prev, [item._id]: val }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview panel */}
              <div className="md:col-span-2 overflow-y-auto pl-2 bg-slate-50 dark:bg-slate-900/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-850">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Sheet Print Preview</label>
                <div 
                  className="grid gap-4" 
                  style={{ gridTemplateColumns: `repeat(${layoutColumns}, minmax(0, 1fr))` }}
                >
                  {selectedItems.map(item => {
                    const copies = printQuantities[item._id] || 1;
                    return Array.from({ length: copies }).map((_, idx) => (
                      <BarcodeRenderer
                        key={`${item._id}-${idx}`}
                        value={item.sku}
                        name={item.name}
                        brand={item.brand}
                        price={item.sellingPrice}
                      />
                    ));
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-150 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-clinic-500 hover:bg-clinic-600 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 transition-colors text-xs flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Sticker Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Wrapper (Rendered only on print media) */}
      {showPrintModal && (
        <div className="hidden print-area-only">
          <div 
            className="grid gap-4" 
            style={{ 
              gridTemplateColumns: `repeat(${layoutColumns}, minmax(0, 1fr))`,
              width: '100%',
              margin: '0',
              padding: '0'
            }}
          >
            {selectedItems.map(item => {
              const copies = printQuantities[item._id] || 1;
              return Array.from({ length: copies }).map((_, idx) => (
                <div key={`print-${item._id}-${idx}`} className="print-label-item">
                  <BarcodeRenderer
                    value={item.sku}
                    name={item.name}
                    brand={item.brand}
                    price={item.sellingPrice}
                  />
                </div>
              ));
            })}
          </div>
        </div>
      )}
      </div>

      {/* Bulk Action Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-6 border border-slate-800 animate-slide-up no-print">
          <span className="text-xs font-bold">{selectedItems.length} products selected</span>
          <div className="flex gap-2">
            <button
              onClick={handleOpenBulkPrint}
              className="px-3.5 py-1.5 bg-clinic-500 hover:bg-clinic-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Barcodes
            </button>
            <button
              onClick={() => setSelectedItems([])}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Barcode Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-4xl bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Printer className="w-5 h-5 text-clinic-500" />
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Print SKU Barcodes</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">Configure sticker counts and column layout for printing.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden flex-1 mb-6">
              {/* Configuration panel */}
              <div className="md:col-span-1 border-r border-slate-100 dark:border-slate-800 pr-6 overflow-y-auto space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Sticker Grid Columns</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(cols => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => setLayoutColumns(cols)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          layoutColumns === cols
                            ? 'bg-clinic-500 border-clinic-500 text-white'
                            : 'border-slate-200 dark:border-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {cols} Col
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Stickers Copies</label>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                    {selectedItems.map(item => (
                      <div key={item._id} className="flex justify-between items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-850">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold truncate dark:text-slate-200">{item.name}</p>
                          <p className="text-[9px] font-mono text-slate-400">{item.sku}</p>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-center text-xs dark:text-white font-bold"
                          value={printQuantities[item._id] || 1}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value) || 1);
                            setPrintQuantities(prev => ({ ...prev, [item._id]: val }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview panel */}
              <div className="md:col-span-2 overflow-y-auto pl-2 bg-slate-50 dark:bg-slate-900/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-850">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Sheet Print Preview</label>
                <div 
                  className="grid gap-4" 
                  style={{ gridTemplateColumns: `repeat(${layoutColumns}, minmax(0, 1fr))` }}
                >
                  {selectedItems.map(item => {
                    const copies = printQuantities[item._id] || 1;
                    return Array.from({ length: copies }).map((_, idx) => (
                      <BarcodeRenderer
                        key={`${item._id}-${idx}`}
                        value={item.sku}
                        name={item.name}
                        brand={item.brand}
                        price={item.sellingPrice}
                      />
                    ));
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-150 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-clinic-500 hover:bg-clinic-600 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 transition-colors text-xs flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Sticker Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Wrapper (Rendered only on print media) */}
      {showPrintModal && (
        <div className="hidden print-area-only">
          <div 
            className="grid gap-4" 
            style={{ 
              gridTemplateColumns: `repeat(${layoutColumns}, minmax(0, 1fr))`,
              width: '100%',
              margin: '0',
              padding: '0'
            }}
          >
            {selectedItems.map(item => {
              const copies = printQuantities[item._id] || 1;
              return Array.from({ length: copies }).map((_, idx) => (
                <div key={`print-${item._id}-${idx}`} className="print-label-item">
                  <BarcodeRenderer
                    value={item.sku}
                    name={item.name}
                    brand={item.brand}
                    price={item.sellingPrice}
                  />
                </div>
              ));
            })}
          </div>
        </div>
      )}

      {/* Quick Stock Update Modal (Scan Detected) */}
      {quickUpdateItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-md bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative">
            <button
              onClick={() => setQuickUpdateItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-clinic-500">
              <Printer className="w-5 h-5 animate-pulse" />
              <h3 className="text-base font-black text-slate-850 dark:text-white">Quick Stock Update</h3>
            </div>
            <p className="text-[11px] text-slate-450 mb-5">
              Barcode scan matched an existing product catalog SKU. Add quantity to stock.
            </p>

            {quickUpdateError && (
              <div className="mb-4 p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold">
                {quickUpdateError}
              </div>
            )}

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850 mb-5 space-y-2">
              <div className="flex justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Product Name</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{quickUpdateItem.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Brand</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{quickUpdateItem.brand || 'No Brand'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">SKU / Code</span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-350">{quickUpdateItem.sku}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-2 mt-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Current Stock</span>
                <span className="text-xs font-black text-clinic-600 dark:text-clinic-400">{quickUpdateItem.quantity} units</span>
              </div>
            </div>

            <form onSubmit={handleQuickStockUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  autoFocus
                  placeholder="1"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white font-bold"
                  value={quickAddQty}
                  onChange={(e) => setQuickAddQty(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickUpdateItem(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickUpdateLoading}
                  className="px-5 py-2 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors text-xs disabled:opacity-50"
                >
                  {quickUpdateLoading ? 'Updating...' : 'Add to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Scanner Modal Overlay */}
      {showCameraScanner && (
        <BarcodeCameraScanner
          onScanSuccess={handleCameraScanSuccess}
          onClose={() => setShowCameraScanner(false)}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-lg bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingItem(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6">Edit Catalog Product</h3>

            {editError && (
              <div className="mb-4 p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditItemSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Ray-Ban Wayfarer"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">SKU / Barcode Code</label>
                  <input
                    type="text"
                    required
                    placeholder="RB-4105-01"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Category</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white dark:bg-darkbg-100"
                    value={editItemCategory}
                    onChange={(e) => setEditItemCategory(e.target.value)}
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
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Supplier</label>
                  <input
                    type="text"
                    placeholder="Luxottica Inc."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={editSupplier}
                    onChange={(e) => setEditSupplier(e.target.value)}
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
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Retail Price</label>
                  <input
                    type="number"
                    required
                    placeholder="4999"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="12"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Alert Level</label>
                  <input
                    type="number"
                    required
                    placeholder="3"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={editMinStockAlert}
                    onChange={(e) => setEditMinStockAlert(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors text-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-md bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative">
            <button
              onClick={() => setDeletingItemId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-black text-slate-850 dark:text-white">Delete Catalog Item</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to delete this product from the inventory catalog? This action is permanent and cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingItemId(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                No, Keep Product
              </button>
              <button
                type="button"
                onClick={handleDeleteItemSubmit}
                disabled={deleteLoading}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-md shadow-rose-500/10 transition-colors text-xs disabled:opacity-50 cursor-pointer"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled sheet override rules for printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide all no-print elements, sidebars, headers, and modals */
          aside, nav, header, button, .no-print, .modal-backdrop, [role="dialog"], .modal {
            display: none !important;
            visibility: hidden !important;
          }
          /* Reset main containers margins/paddings */
          #root, body, html, main, .main-content {
            background: white !important;
            overflow: visible !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
          }
          /* Show print grid wrapper */
          .print-area-only {
            display: grid !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            z-index: 99999 !important;
          }
          .print-label-item {
            border: 1px dashed #ccc !important;
            page-break-inside: avoid;
          }
        }
      `}} />
    </>
  );
};

export default InventoryPage;

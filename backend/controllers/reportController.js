import Patient from '../models/Patient.js';
import Order from '../models/Order.js';
import Appointment from '../models/Appointment.js';
import Invoice from '../models/Invoice.js';
import Inventory from '../models/Inventory.js';
import Notification from '../models/Notification.js';
import { dashboardCache } from '../utils/cache.js';

// @desc    Get dashboard metrics and analytics
// @route   GET /api/reports/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
  try {
    const storeId = req.storeId;

    // Check custom cache
    const cachedData = dashboardCache.get(storeId, 'dashboard');
    if (cachedData) {
      console.log(`[DSA-Cache] Dashboard served from memory for store: ${storeId}`);
      return res.json({
        success: true,
        ...cachedData,
      });
    }

    // 1. Total Patients
    const totalPatients = await Patient.countDocuments({ storeId });

    // 2. Today's Appointments count
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);
    const dailyAppointments = await Appointment.countDocuments({
      storeId,
      appointmentDate: { $gte: todayStart, $lte: todayEnd },
      status: 'scheduled',
    });

    // 3. Total Revenue
    const paidInvoices = await Invoice.find({ storeId, status: 'paid' });
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // 4. Pending glass lab orders
    const pendingOrders = await Order.countDocuments({
      storeId,
      orderStatus: { $in: ['pending', 'sent-to-lab'] },
    });

    // 5. Low stock alerts count
    const lowStockItems = await Inventory.countDocuments({
      storeId,
      $expr: { $lte: ['$quantity', '$minStockAlert'] },
    });

    // 6. Recent activity (Combination of recent patients and orders)
    const recentPatients = await Patient.find({ storeId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name phone createdAt');

    const recentOrders = await Order.find({ storeId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('patientId', 'name')
      .select('orderNumber finalAmount orderStatus createdAt');

    const activities = [
      ...recentPatients.map(p => ({
        type: 'patient',
        title: 'New Patient Registered',
        desc: `${p.name} (${p.phone}) was onboarded.`,
        time: p.createdAt,
      })),
      ...recentOrders.map(o => ({
        type: 'order',
        title: `Order Placed: ${o.orderNumber}`,
        desc: `Amount: ₹${o.finalAmount} | Status: ${o.orderStatus}`,
        time: o.createdAt,
      })),
    ].sort((a,b) => b.time - a.time).slice(0, 5);

    // 7. Recharts simulated/calculated trends (Last 6 Months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueTrend = [];
    const patientGrowth = [];

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - i);
      const mIdx = targetDate.getMonth();
      const year = targetDate.getFullYear();
      
      const mStart = new Date(year, mIdx, 1);
      const mEnd = new Date(year, mIdx + 1, 0, 23, 59, 59, 999);

      // Aggregate revenue for this month
      const monthInvoices = await Invoice.find({
        storeId,
        status: 'paid',
        paymentDate: { $gte: mStart, $lte: mEnd },
      });
      const monthRevenue = monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

      // Count patient growth
      const monthPatientsCount = await Patient.countDocuments({
        storeId,
        createdAt: { $gte: mStart, $lte: mEnd },
      });

      revenueTrend.push({
        month: `${months[mIdx]} ${year.toString().slice(2)}`,
        revenue: monthRevenue,
      });

      patientGrowth.push({
        month: `${months[mIdx]} ${year.toString().slice(2)}`,
        patients: monthPatientsCount,
      });
    }

    // 8. Low Stock Catalog list
    const lowStockList = await Inventory.find({
      storeId,
      $expr: { $lte: ['$quantity', '$minStockAlert'] },
    }).limit(5);

    // 9. Notifications list
    const notifications = await Notification.find({ storeId })
      .sort({ createdAt: -1 })
      .limit(10);

    const dashboardData = {
      metrics: {
        totalPatients,
        dailyAppointments,
        totalRevenue,
        pendingOrders,
        lowStockItems,
      },
      charts: {
        revenueTrend,
        patientGrowth,
      },
      recentActivities: activities,
      lowStockList,
      notifications,
    };

    // Cache the aggregated dashboard results for 2 minutes
    dashboardCache.set(storeId, 'dashboard', dashboardData);

    res.json({
      success: true,
      ...dashboardData,
    });
  } catch (error) {
    console.error('Report Aggregation Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating report dashboard data' });
  }
};

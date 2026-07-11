import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Load routes
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import superadminRoutes from './routes/superadminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import marketingRoutes from './routes/marketingRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import labPartnerRoutes from './routes/labPartnerRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import { startMarketingScheduler } from './utils/marketingScheduler.js';
import { invalidateOnWrite } from './middleware/cacheInvalidator.js';

// Models for seed
import User from './models/User.js';
import { seedStores } from './utils/seedStores.js';

dotenv.config();

// Connect to Database
connectDB().then(async () => {
  // Seed Super Admin if not exists
  try {
    const adminEmail = 'eyelitzcrm@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Eyelitz Super Admin',
        email: adminEmail,
        password: 'adminpassword123',
        role: 'superadmin',
        active: true,
        isVerified: true,
      });
      console.log('Seeded platform Super Admin (eyelitzcrm@gmail.com / adminpassword123)');
    }
    
    // Seed 10 mock stores and owners
    await seedStores();
  } catch (err) {
    console.error('Seeding Error:', err);
  }
});

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000, // Limit each IP to 1000 requests per window
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);

// Body Parser
app.use(express.json());

// Cache Invalidation Middleware for Tenant Dashboards (DSA Optimization)
app.use(invalidateOnWrite);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/partners', labPartnerRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Eyelitz CRM Multi-Tenant API is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  // Start automated marketing background scheduler
  startMarketingScheduler();
});

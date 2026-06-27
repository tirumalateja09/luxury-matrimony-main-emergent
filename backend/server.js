const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

// Load .env from the backend directory (works regardless of where node is run from)
dotenv.config({ path: path.join(__dirname, '.env') });
const cors = require('cors');
const connectDB = require('./config/db');
require('./utils/cronJobs');

// Import Route Files
const authRoutes = require('./routes/authRoutes.js');
const profileRoutes = require('./routes/profileRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const interestRoutes = require('./routes/interestRoutes.js');
const shortlistRoutes = require('./routes/shortlistRoutes.js');
const chatRoutes = require('./routes/chatRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const messageRoutes = require('./routes/messageRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
const searchRoutes = require('./routes/searchRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const viewRoutes = require('./routes/viewRoutes.js');
const contactRoutes = require('./routes/contactRoutes');
const photoRoutes = require('./routes/photoRoutes');
const sliderRoutes = require('./routes/sliderRoutes');
const homeSliderRoutes = require('./routes/homeSliderRoutes');

const app = express();

// ===================== CORS =====================
const allowedOrigins = (process.env.FRONTEND_URLS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json());

// ===================== DATABASE =====================
connectDB().then(() => {
  seedAdmin();
});

// ===================== SEED ADMIN =====================
async function seedAdmin() {
  try {
    const Admin = require('./models/Admin');
    const bcrypt = require('bcryptjs');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rvrluxury.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const existing = await Admin.findOne({ email: adminEmail });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      await Admin.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'super_admin',
      });
      console.log(`Admin seeded: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Admin seed error:', error.message);
  }
}

// ===================== API ROUTES =====================
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/interest', interestRoutes);
app.use('/api/shortlist', shortlistRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/user', userRoutes);
app.use('/api/views', viewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/sliders', sliderRoutes);
app.use('/api/home-sliders', homeSliderRoutes);

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'matrimonial-nodejs-api' }));
app.get('/', (req, res) => res.send('Matrimonial Node.js API is running...'));

// ===================== START SERVER =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

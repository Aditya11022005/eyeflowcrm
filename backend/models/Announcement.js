import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please add banner announcement text'],
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  link: {
    type: String,
    default: '',
  },
  bgColor: {
    type: String,
    default: 'bg-clinic-600', // CSS class or hex color code
  },
  textColor: {
    type: String,
    default: 'text-white',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Announcement', AnnouncementSchema);

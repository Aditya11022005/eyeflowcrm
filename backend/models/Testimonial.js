import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  role: {
    type: String,
    required: [true, 'Please add a role/designation'],
    trim: true,
  },
  clinic: {
    type: String,
    required: [true, 'Please add a clinic or store name'],
    trim: true,
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5,
  },
  avatar: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    required: [true, 'Please add testimonial text'],
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Testimonial', TestimonialSchema);

import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please add appointment date'],
  },
  timeSlot: {
    type: String,
    required: [true, 'Please add appointment time slot'], // e.g. "10:30 AM" or "14:00"
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Appointment', AppointmentSchema);

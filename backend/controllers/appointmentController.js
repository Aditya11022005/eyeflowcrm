import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

// @desc    Get all appointments for the clinic
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  const { date } = req.query;

  try {
    const query = { storeId: req.storeId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23,59,59,999);

      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name phone email')
      .populate('doctorId', 'name')
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error('Get Appointments Error:', error);
    res.status(500).json({ success: false, message: 'Server error listing appointments' });
  }
};

// @desc    Create an appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  const { patientId, doctorId, appointmentDate, timeSlot, notes } = req.body;

  try {
    const patient = await Patient.findOne({ _id: patientId, storeId: req.storeId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const doctor = await User.findOne({ _id: doctorId, storeId: req.storeId, role: 'doctor' });
    if (!doctor) {
      return res.status(400).json({ success: false, message: 'Assignee doctor not found' });
    }

    // Check if slot is already occupied for this doctor on this day
    const parsedDate = new Date(appointmentDate);
    parsedDate.setHours(0,0,0,0);
    const nextDay = new Date(parsedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const slotBusy = await Appointment.findOne({
      storeId: req.storeId,
      doctorId,
      timeSlot,
      appointmentDate: { $gte: parsedDate, $lt: nextDay },
      status: 'scheduled',
    });

    if (slotBusy) {
      return res.status(400).json({ success: false, message: `Time slot ${timeSlot} is already booked for Dr. ${doctor.name}` });
    }

    const appointment = await Appointment.create({
      storeId: req.storeId,
      patientId,
      doctorId,
      appointmentDate,
      timeSlot,
      notes,
    });

    res.status(201).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error('Create Appointment Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating appointment' });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  const { status, notes, appointmentDate, timeSlot } = req.body;

  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (status) {
      appointment.status = status;
    }
    if (notes !== undefined) {
      appointment.notes = notes;
    }
    if (appointmentDate) {
      appointment.appointmentDate = appointmentDate;
    }
    if (timeSlot) {
      appointment.timeSlot = timeSlot;
    }

    await appointment.save();

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error('Update Appointment Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating appointment' });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error('Delete Appointment Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting appointment' });
  }
};

import Patient from '../models/Patient.js';
import Prescription from '../models/Prescription.js';
import Order from '../models/Order.js';

// @desc    Get all patients for store with pagination and search
// @route   GET /api/patients
// @access  Private
export const getPatients = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  try {
    const query = { storeId: req.storeId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const count = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      patients,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        totalPatients: count,
      },
    });
  } catch (error) {
    console.error('Get Patients Error:', error);
    res.status(500).json({ success: false, message: 'Server error listing patients' });
  }
};

// @desc    Create a patient
// @route   POST /api/patients
// @access  Private
export const createPatient = async (req, res) => {
  const { name, phone, email, gender, dob, address, medicalHistory, notes } = req.body;

  try {
    const patient = await Patient.create({
      storeId: req.storeId,
      name,
      phone,
      email,
      gender,
      dob,
      address,
      medicalHistory: Array.isArray(medicalHistory) ? medicalHistory : [],
      notes,
    });

    res.status(201).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error('Create Patient Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating patient' });
  }
};

// @desc    Get single patient by ID alongside their files and histories
// @route   GET /api/patients/:id
// @access  Private
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Fetch eye prescriptions history
    const prescriptions = await Prescription.find({ patientId: patient._id, storeId: req.storeId })
      .populate('doctorId', 'name')
      .sort({ checkupDate: -1 });

    // Fetch glass order history
    const orders = await Order.find({ patientId: patient._id, storeId: req.storeId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      patient,
      prescriptions,
      orders,
    });
  } catch (error) {
    console.error('Get Patient Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving patient profile' });
  }
};

// @desc    Update a patient
// @route   PUT /api/patients/:id
// @access  Private
export const updatePatient = async (req, res) => {
  try {
    let patient = await Patient.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error('Update Patient Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating patient' });
  }
};

// @desc    Delete a patient
// @route   DELETE /api/patients/:id
// @access  Private (Owner/Doctor only)
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await Patient.findByIdAndDelete(req.params.id);

    // Delete associated orders and prescriptions to clean database
    await Prescription.deleteMany({ patientId: req.params.id, storeId: req.storeId });
    await Order.deleteMany({ patientId: req.params.id, storeId: req.storeId });

    res.json({
      success: true,
      message: 'Patient and all associated records deleted successfully',
    });
  } catch (error) {
    console.error('Delete Patient Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting patient' });
  }
};

// @desc    Add attachment to patient
// @route   POST /api/patients/:id/attachments
// @access  Private
export const addPatientAttachment = async (req, res) => {
  const { name, url, fileType } = req.body;
  try {
    const patient = await Patient.findOne({ _id: req.params.id, storeId: req.storeId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient.attachments.push({ name, url, fileType });
    await patient.save();

    res.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error('Add Attachment Error:', error);
    res.status(500).json({ success: false, message: 'Server error adding attachment' });
  }
};

// @desc    Delete attachment from patient
// @route   DELETE /api/patients/:id/attachments/:attachmentId
// @access  Private
export const deletePatientAttachment = async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, storeId: req.storeId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient.attachments = patient.attachments.filter(
      (att) => att._id.toString() !== req.params.attachmentId
    );
    await patient.save();

    res.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error('Delete Attachment Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting attachment' });
  }
};


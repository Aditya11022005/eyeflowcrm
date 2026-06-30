import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';

// @desc    Get all prescriptions in the store
// @route   GET /api/prescriptions
// @access  Private
export const getPrescriptions = async (req, res) => {
  const { patientId } = req.query;

  try {
    const query = { storeId: req.storeId };
    if (patientId) {
      query.patientId = patientId;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'name phone')
      .populate('doctorId', 'name')
      .sort({ checkupDate: -1 })
      .lean();

    res.json({
      success: true,
      prescriptions,
    });
  } catch (error) {
    console.error('Get Prescriptions Error:', error);
    res.status(500).json({ success: false, message: 'Server error listing prescriptions' });
  }
};

// @desc    Create an eye prescription checkup record
// @route   POST /api/prescriptions
// @access  Private (Doctor or Owner)
export const createPrescription = async (req, res) => {
  const { patientId, rightEye, leftEye, lensTypeRecommended, remarks, doctorSignature, checkupDate } = req.body;

  try {
    // Confirm patient exists under this tenant
    const patient = await Patient.findOne({ _id: patientId, storeId: req.storeId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const prescription = await Prescription.create({
      storeId: req.storeId,
      patientId,
      doctorId: req.user._id,
      rightEye,
      leftEye,
      lensTypeRecommended,
      remarks,
      doctorSignature: doctorSignature || req.user.name,
      checkupDate: checkupDate ? new Date(checkupDate) : new Date(),
    });

    res.status(201).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error('Create Prescription Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error saving prescription' });
  }
};

// @desc    Get single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, storeId: req.storeId })
      .populate('patientId', 'name phone dob gender address')
      .populate('doctorId', 'name email')
      .populate('storeId')
      .lean();

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription record not found' });
    }

    res.json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error('Get Prescription Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving prescription' });
  }
};

// @desc    Delete a prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private (Owner/Doctor only)
export const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription record not found' });
    }

    await Prescription.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Prescription record deleted successfully',
    });
  } catch (error) {
    console.error('Delete Prescription Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting prescription' });
  }
};

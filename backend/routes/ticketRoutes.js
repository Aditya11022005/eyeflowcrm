import express from 'express';
import { 
  createTicket, 
  getClientTickets, 
  getAdminTickets, 
  getTicketById, 
  addTicketResponse, 
  updateTicketStatus 
} from '../controllers/ticketController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';

const router = express.Router();

// All routes require user logging in
router.use(protect);

// Client endpoints
router.route('/')
  .post(createTicket)
  .get(getClientTickets);

// Super Admin platform view of all queries
router.get('/admin', checkRole('superadmin'), getAdminTickets);

// Specific ticket operations
router.route('/:id')
  .get(getTicketById);

router.post('/:id/reply', addTicketResponse);
router.put('/:id/status', updateTicketStatus);

export default router;

import express from 'express';
import {
  getAllItems,
  getItemById,
  createItem,
  updateItemStatus,
  deleteItem,
  getStats,
} from '../controllers/itemController.js';

const router = express.Router();

// Routes
router.route('/').get(getAllItems).post(createItem);
router.route('/stats').get(getStats);
router.route('/:id').get(getItemById).delete(deleteItem);
router.route('/:id/status').patch(updateItemStatus);

export default router;

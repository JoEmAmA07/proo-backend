import { Item } from '../models/Item.js';
import { INITIAL_ITEMS } from '../data/seedData.js';

// Calculate aggregated metrics
const computeStats = async () => {
  const [total, lost, found, resolved] = await Promise.all([
    Item.countDocuments(),
    Item.countDocuments({ type: 'lost', status: { $ne: 'resolved' } }),
    Item.countDocuments({ type: 'found', status: { $ne: 'resolved' } }),
    Item.countDocuments({ status: 'resolved' }),
  ]);

  return { total, lost, found, resolved };
};

// @desc    Get all items with optional filtering and search
// @route   GET /api/items
export const getAllItems = async (req, res) => {
  try {
    const { type, category, search } = req.query;
    const filter = {};

    // Filter by type / status
    if (type === 'lost') {
      filter.type = 'lost';
      filter.status = { $ne: 'resolved' };
    } else if (type === 'found') {
      filter.type = 'found';
      filter.status = { $ne: 'resolved' };
    } else if (type === 'resolved') {
      filter.status = 'resolved';
    }

    // Filter by category
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Search query
    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { location: regex },
        { reporterName: regex },
        { category: regex },
      ];
    }

    const items = await Item.find(filter).sort({ createdAt: -1 });
    const stats = await computeStats();

    res.status(200).json({
      success: true,
      count: items.length,
      stats,
      items,
    });
  } catch (error) {
    console.error('[itemController.getAllItems] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve campus items',
      error: error.message,
    });
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findOne({ id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item with ID '${id}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error('[itemController.getItemById] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve item',
      error: error.message,
    });
  }
};

// @desc    Report new lost or found item
// @route   POST /api/items
export const createItem = async (req, res) => {
  try {
    const {
      title,
      type,
      category,
      location,
      date,
      description,
      reporterName,
      reporterEmail,
      reporterPhone,
      storageLocation,
    } = req.body;

    // Validation
    if (!title || !type || !category || !location || !reporterName || !reporterEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, type, category, location, reporterName, reporterEmail)',
      });
    }

    const id = req.body.id || `item-${Date.now()}`;
    const createdAt = req.body.createdAt || new Date().toISOString();

    const newItem = await Item.create({
      id,
      title: title.trim(),
      type,
      category,
      location: location.trim(),
      date: date || new Date().toISOString().split('T')[0],
      description: (description || '').trim(),
      reporterName: reporterName.trim(),
      reporterEmail: reporterEmail.trim(),
      reporterPhone: (reporterPhone || '').trim(),
      status: req.body.status || 'open',
      storageLocation: (storageLocation || '').trim(),
      createdAt,
    });

    console.log(`[API] Created item: "${newItem.title}" (${newItem.id})`);

    res.status(201).json({
      success: true,
      message: `Successfully reported "${newItem.title}"`,
      item: newItem,
    });
  } catch (error) {
    console.error('[itemController.createItem] Error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create item',
      error: error.message,
    });
  }
};

// @desc    Update item status (e.g. toggle resolved/open/claimed)
// @route   PATCH /api/items/:id/status
export const updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['open', 'claimed', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: 'open', 'claimed', 'resolved'",
      });
    }

    const updatedItem = await Item.findOneAndUpdate(
      { id },
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: `Item with ID '${id}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Item status updated to '${status}'`,
      item: updatedItem,
    });
  } catch (error) {
    console.error('[itemController.updateItemStatus] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item status',
      error: error.message,
    });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Item.findOneAndDelete({ id });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Item with ID '${id}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Item '${id}' successfully deleted`,
    });
  } catch (error) {
    console.error('[itemController.deleteItem] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message,
    });
  }
};

// @desc    Get summary statistics
// @route   GET /api/stats
export const getStats = async (req, res) => {
  try {
    const stats = await computeStats();

    // Group counts by category
    const categoryAgg = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const categoryCounts = {};
    categoryAgg.forEach((entry) => {
      categoryCounts[entry._id] = entry.count;
    });

    res.status(200).json({
      success: true,
      stats,
      categoryCounts,
    });
  } catch (error) {
    console.error('[itemController.getStats] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compute stats',
      error: error.message,
    });
  }
};

// Auto-seed function called on server boot if empty
export const autoSeedIfEmpty = async () => {
  try {
    const count = await Item.countDocuments();
    if (count === 0) {
      console.log('[Seed] Database is empty. Seeding initial campus items...');
      await Item.insertMany(INITIAL_ITEMS);
      console.log(`[Seed] Successfully seeded ${INITIAL_ITEMS.length} initial items!`);
    } else {
      console.log(`[Seed] Database already contains ${count} items. Skipping initial seed.`);
    }
  } catch (error) {
    console.error('[Seed] Seeding error:', error.message);
  }
};

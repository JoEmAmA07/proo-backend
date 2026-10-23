import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['lost', 'found'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Item category is required'],
      enum: [
        'ID & Cards',
        'Electronics',
        'Wallets & Bags',
        'Keys',
        'Bottles & Tumblers',
        'Books & Notes',
        'Clothing & Accessories',
        'Other',
      ],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Campus location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    reporterName: {
      type: String,
      required: [true, 'Reporter name is required'],
      trim: true,
    },
    reporterEmail: {
      type: String,
      required: [true, 'Reporter email is required'],
      trim: true,
      lowercase: true,
    },
    reporterPhone: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'claimed', 'resolved'],
      default: 'open',
      index: true,
    },
    storageLocation: {
      type: String,
      default: '',
      trim: true,
    },
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// High performance indexes
itemSchema.index({ type: 1, status: 1, category: 1 });
itemSchema.index(
  {
    title: 'text',
    description: 'text',
    location: 'text',
    reporterName: 'text',
  },
  {
    weights: {
      title: 10,
      description: 5,
      location: 3,
      reporterName: 2,
    },
    name: 'item_text_search_index',
  }
);

export const Item = mongoose.model('Item', itemSchema);

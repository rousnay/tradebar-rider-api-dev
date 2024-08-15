import { Schema, Document } from 'mongoose';

export const OngoingOrderSchema = new Schema<OngoingOrder>({
  orderId: { type: Number, required: true },
  deliveryId: { type: Number, required: true },
  shippingStatus: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  distance: { type: String, default: null },
  duration: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Interface for TypeScript type-checking and Mongoose document methods
export interface OngoingOrder extends Document {
  orderId: number;
  deliveryId: number;
  shippingStatus: string;
  title: string;
  message: string;
  distance: string;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
}

import { Schema, Document } from 'mongoose';

export const LocationSchema = new Schema({
  riderId: { type: Number, unique: true, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

// Create a 2dsphere index on the location fields
LocationSchema.index({ latitude: 1, longitude: 1 });

export interface Location extends Document {
  riderId: number;
  latitude: number;
  longitude: number;
  updatedAt: Date;
}

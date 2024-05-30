import { Schema, Document } from 'mongoose';

export const LocationSchema = new Schema({
  riderId: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export interface Location extends Document {
  riderId: string;
  latitude: number;
  longitude: number;
  updatedAt: Date;
}

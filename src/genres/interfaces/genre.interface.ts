import { Document } from 'mongoose';

export interface Genre extends Document {
  readonly id: string;
  readonly text: string;
}

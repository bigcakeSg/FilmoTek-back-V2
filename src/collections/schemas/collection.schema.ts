import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CollectionDocument = HydratedDocument<Collection>;

@Schema()
export class Collection {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], required: true })
  owner: mongoose.Types.ObjectId;

  @Prop({ default: false })
  private: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }], default: [] })
  movies: mongoose.Types.ObjectId[];
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

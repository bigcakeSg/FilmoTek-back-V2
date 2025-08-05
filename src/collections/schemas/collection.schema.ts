import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CollectionDocument = HydratedDocument<Collection>;

@Schema()
export class Collection {
  @Prop({ required: true, unique: true })
  name: string;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

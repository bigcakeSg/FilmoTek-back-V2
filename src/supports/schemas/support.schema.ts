import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SupportDocument = HydratedDocument<Support>;

@Schema()
export class Support {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  movies: string[];
}

export const SupportSchema = SchemaFactory.createForClass(Support);

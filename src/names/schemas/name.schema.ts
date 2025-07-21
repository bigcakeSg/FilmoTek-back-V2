import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NameDocument = HydratedDocument<Name>;

@Schema()
export class Name {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  text: string;
}

export const NameSchema = SchemaFactory.createForClass(Name);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CompanieDocument = HydratedDocument<Companie>;

@Schema()
export class Companie {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  name: string;
}

export const CompanieSchema = SchemaFactory.createForClass(Companie);

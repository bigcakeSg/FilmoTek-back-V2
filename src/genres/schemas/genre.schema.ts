import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GenreDocument = HydratedDocument<Genre>;

@Schema()
export class Genre {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  text: string;
}

export const GenreSchema = SchemaFactory.createForClass(Genre);

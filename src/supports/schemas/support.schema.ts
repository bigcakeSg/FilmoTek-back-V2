import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Picture, PictureSchema } from 'src/pictures/schemas/picture.schema';

export type SupportDocument = HydratedDocument<Support>;

@Schema()
export class Support {
  @Prop({ required: true, unique: true })
  type: string;

  @Prop({ required: true })
  movies: string[];

  @Prop({ type: PictureSchema, required: false })
  picture: Picture;
}

export const SupportSchema = SchemaFactory.createForClass(Support);

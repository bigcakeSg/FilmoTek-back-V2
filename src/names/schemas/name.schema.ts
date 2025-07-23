import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Picture, PictureSchema } from 'src/pictures/schemas/picture.schema';

export type NameDocument = HydratedDocument<Name>;

@Schema()
export class Name {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  text: string;

  @Prop({ type: PictureSchema, required: false })
  picture: Picture;
}

export const NameSchema = SchemaFactory.createForClass(Name);

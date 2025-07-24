import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Picture {
  @Prop({ required: true })
  url: string;

  @Prop({ required: false })
  height: number;

  @Prop({ required: false })
  width: number;
}

export const PictureSchema = SchemaFactory.createForClass(Picture);

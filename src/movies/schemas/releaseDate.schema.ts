import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class ReleaseDate {
  @Prop({ required: false })
  year: number;

  @Prop({ required: false })
  month: number;

  @Prop({ required: false })
  day: number;
}

export const ReleaseDateSchema = SchemaFactory.createForClass(ReleaseDate);

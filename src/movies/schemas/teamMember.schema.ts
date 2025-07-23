import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Picture, PictureSchema } from './picture.schema';

@Schema()
export class TeamMember {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Name', required: true })
  name: mongoose.Types.ObjectId;

  @Prop({ type: [String], default: [] })
  attributes: string[];
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);

@Schema()
export class CastMember extends TeamMember {
  @Prop({ default: [] })
  characters: string[];

  @Prop({ type: PictureSchema, required: true })
  picture: Picture;
}

export const CastMemberSchema = SchemaFactory.createForClass(CastMember);

@Schema()
export class Casting {
  @Prop({ type: [CastMemberSchema], default: [] })
  principal: CastMember[];

  @Prop({ type: [CastMemberSchema], default: [] })
  extended: CastMember[];
}

export const CastingSchema = SchemaFactory.createForClass(Casting);

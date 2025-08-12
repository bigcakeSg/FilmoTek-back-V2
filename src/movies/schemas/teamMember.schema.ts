import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class TeamMember {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Name', required: true })
  name: mongoose.Types.ObjectId;

  @Prop({ type: [String], required: false })
  characters: string[];

  @Prop({ type: [String], default: [] })
  attributes: string[];
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);

@Schema()
export class Casting {
  @Prop({ type: [TeamMemberSchema], default: [] })
  principal: TeamMember[];

  @Prop({ type: [TeamMemberSchema], default: [] })
  extended: TeamMember[];
}

export const CastingSchema = SchemaFactory.createForClass(Casting);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class TeamMember {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Name', required: true })
  name: mongoose.Types.ObjectId;

  @Prop({ type: [String], required: false })
  characters: string[];
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Casting, CastingSchema, TeamMember, TeamMemberSchema } from './teamMember.schema';

export type MovieDocument = HydratedDocument<Movie>;

@Schema()
export class Movie {
  @Prop({ required: true, unique: true })
  imdbId: string;

  @Prop({ required: true })
  originalTitle: string;

  @Prop({ required: true })
  normalizedOriginalTitle: string;

  @Prop({ required: false })
  frenchTitle: string;

  @Prop({ required: false })
  normalizedFrenchTitle: string;

  @Prop({ required: false })
  englishTitle: string;

  @Prop({ required: false })
  normalizedEnglishTitle: string;

  @Prop({ required: false })
  picture: string;

  @Prop({ required: true })
  releaseDate: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  plot: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }] })
  genres: mongoose.Types.ObjectId[];

  @Prop({ type: [TeamMemberSchema], default: [] })
  directors: TeamMember[];

  @Prop({ type: [TeamMemberSchema], default: [] })
  writers: TeamMember[];

  @Prop({ type: CastingSchema, default: { principal: [], extended: [] } })
  casting: Casting;

  @Prop({ default: [] })
  supports: string[];

  @Prop({ default: [] })
  videos: string[];
}

export const MovieSchema = SchemaFactory.createForClass(Movie);

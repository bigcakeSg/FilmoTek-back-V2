import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Picture, PictureSchema } from '../../pictures/schemas/picture.schema';
import { Casting, CastingSchema, TeamMember, TeamMemberSchema } from './teamMember.schema';
import { ReleaseDate, ReleaseDateSchema } from './releaseDate.schema';

export type MovieDocument = HydratedDocument<Movie>;

@Schema()
export class Movie {
  @Prop({ required: true, unique: true })
  imdbId: string;

  @Prop({ required: true })
  originalTitle: string;

  @Prop({ type: Array, default: [] })
  regionalTitles: { title: string; region: string }[];

  @Prop({ type: PictureSchema, required: false })
  picture: Picture;

  @Prop({ type: ReleaseDateSchema, required: true })
  releaseDate: ReleaseDate;

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

  @Prop({ default: true })
  seen: boolean;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);

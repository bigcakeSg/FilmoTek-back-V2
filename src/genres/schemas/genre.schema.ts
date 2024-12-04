import * as mongoose from 'mongoose';

export const GenreSchema = new mongoose.Schema({
  id: String,
  text: String,
});

import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags.js';


const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: ``,
      trim: true,
    },
    tag: TAGS,
  },
  { timestamps: true }
);

noteSchema.index({
  tag: 1,
});

export const Note = model('Note', noteSchema);

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISpeciality extends Document {
  _id: mongoose.Types.ObjectId; 
  name: string;
  isActive: boolean;
}

const specialitySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true }
});

const Speciality: Model<ISpeciality> = mongoose.model<ISpeciality>("Speciality", specialitySchema);

export default Speciality;

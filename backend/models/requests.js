import mongoose from "mongoose";

const { Schema } = mongoose;

const requestSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, required: false },
    artistName: { type: String, required: false },
    artistId: { type: Schema.Types.ObjectId, ref: "Artist" },
    beforeImage: { type: String, required: false },
    afterImage: { type: String, required: false },
    serviceName: { type: String, required: false },
    servicePrice: { type: Number, required: false },
    date: { type: Date, required: true },
    status: { type: String, required: false, default: "Pending" },
    message: { type: String, required: false }
    });

const Request = mongoose.model("Request", requestSchema);
export default Request;
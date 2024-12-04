import mongoose, { Schema, Document, Types } from "mongoose";

//Generamos la interface para typescript
export interface IToken extends Document {
    token: string
    user: Types.ObjectId
    createdAt: Date
}

//Generamos el modelo de mongoose
const TokenSchema: Schema = new Schema ({
    token: {
        type: String,
        required: true
    },
    user: {
        type: Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: '10m'
    }
})

const Token = mongoose.model<IToken>('Token', TokenSchema)
export default Token
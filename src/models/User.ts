import mongoose, { Document, Schema } from "mongoose"

//Generamos la interface para typescript
export interface IUser extends Document {
    email: string
    password: string
    userName: string
    confirmed: boolean
}

//Generamos el modelo de mongoose
const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    confirmed: {
        type: Boolean,
        default: false
    }
},)

const User = mongoose.model<IUser>('User', UserSchema)
export default User

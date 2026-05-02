import mongoose,{Schema,Document,Model} from "mongoose";
export interface IMessage extends Document{
    sender:mongoose.Types.ObjectId,
    receiver:mongoose.Types.ObjectId,
    content:string,
    read:boolean,
    createdAt:Date;
}
const MessageSchema: Schema<IMessage> = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message=mongoose.models.Message||mongoose.model<IMessage>("Message",MessageSchema)
export default Message
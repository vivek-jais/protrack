import mongoose,{Schema,Document} from 'mongoose'
export interface IChatModel extends Document{
    studentId:mongoose.Types.ObjectId,
    projectId:mongoose.Types.ObjectId,
    threadId:string,    //basicall for the langgraph
    messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}
const ChatSessionSchema=new Schema<IChatModel>({
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  threadId: { type: String, required: true, unique: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
},{timestamps:true})
export default mongoose.models.ChatHistory||mongoose.model<IChatModel>('chatHistory',ChatSessionSchema)
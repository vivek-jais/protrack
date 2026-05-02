import io
import PyPDF2
import docx 
from typing import Annotated, Dict, Any, Optional
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.checkpoint.memory import MemorySaver
from dotenv import load_dotenv

load_dotenv()

# Initialize the LLM
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)

def extract_text(file_bytes: bytes, filename: str) -> str:
    """Extracts raw text from PDF, DOCX, or TXT file bytes."""
    text = ""
    try:
        filename_lower = filename.lower()
        
        if filename_lower.endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
                    
        elif filename_lower.endswith('.docx'):
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text += para.text + "\n"
                
        elif filename_lower.endswith('.txt'):
            text = file_bytes.decode('utf-8', errors='ignore')
            
        else:
            return f"[Unsupported file format: {filename}]"
            
    except Exception as e:
        print(f"Error extracting text from {filename}: {e}")
        return ""
        
    return text.strip()

class MentorState(TypedDict):
    messages: Annotated[list, add_messages]
    student_profile: Dict[str, Any]
    project_context: Optional[str]  # Extracted SRS text
    resume_context: Optional[str]   # Extracted Resume text

#professor
def professor_chat_node(state: MentorState):
    """Dynamically adjusts its intelligence and enforces strict topic boundaries."""
    
    profile = state.get("student_profile", {})
    name = profile.get("name", "Student")
    skills = ", ".join(profile.get("skills", []))
    
    srs = state.get("project_context") or ""
    resume = state.get("resume_context") or ""
    
    has_srs = bool(srs.strip())
    has_resume = bool(resume.strip())
    is_first_message = len(state["messages"]) <= 1
    
    system_prompt = f"""
    You are a friendly, approachable, and highly experienced Computer Science Professor mentoring your student, {name}.
    Your tone is conversational, warm, and highly supportive—exactly like a favorite professor chatting during office hours.

    [CONVERSATION STYLE & LENGTH]
    1. Keep your answers SHORT, punchy, and highly practical. Absolutely NO long essays or walls of text. Aim for 1 to 3 brief paragraphs maximum.
    2. Speak to them like a human. Use their name naturally.
    3. When advising them on new technologies or approaches, structure your advice using this exact conversational format:
       "See {name}, although you are good at [Pick a skill from: {skills}], you could do [Insert your project suggestion]. If you wish, you can learn this from [Insert a specific, real-world resource like official docs, a known YouTube channel, or a course platform] and then proceed."
    """

    # Add Welcome Instruction if it's the start of the chat
    if is_first_message:
        system_prompt += f"\nSince this is the beginning of the conversation, warmly welcome {name} to your office hours in a brief, friendly sentence.\n"

    # Add Smart Context Logic
    if has_srs and has_resume:
        system_prompt += f"""
        [STATUS: FULLY CONTEXTUALIZED]
        You have full access to {name}'s resume and the project SRS.
        - SRS Context: {srs}
        - Resume Context: {resume}
        Briefly cross-reference their skills with the SRS when giving your short answers.
        """
    elif has_srs:
        system_prompt += f"""
        [STATUS: PARTIAL CONTEXT - SRS ONLY]
        You have the project SRS but NO resume. 
        - SRS Context: {srs}
        Politely and briefly ask them to upload their Resume so you can tailor your advice to their exact skills.
        """
    elif has_resume:
        system_prompt += f"""
        [STATUS: PARTIAL CONTEXT - RESUME ONLY]
        You have {name}'s resume but NO project SRS.
        - Resume Context: {resume}
        Politely and briefly ask them to upload the project SRS so you know what they are trying to build.
        """
    else:
        system_prompt += """
        [STATUS: NO UPLOADS YET]
        Politely ask them in one short sentence to upload their SRS and Resume so you can give them personalized guidance.
        """

    #strict instructions
    system_prompt += """
    [CRITICAL GUARDRAIL - STRICT ENFORCEMENT]
    Your purpose is strictly limited to Computer Science, software engineering, project architecture, academic mentoring, and career advice. 
    If the user asks a question that falls outside of these domains (e.g., cooking, general trivia, politics, entertainment, writing essays for other subjects), you MUST refuse to answer.
    Reply with EXACTLY this phrase and nothing else: "Sorry, I can't answer that. Let's keep our discussion focused on your project and academic growth."
    """    
    conversation = [SystemMessage(content=system_prompt)] + state["messages"]
    response = llm.invoke(conversation)
    return {"messages": [response]}

#building the graph
workflow = StateGraph(MentorState)
workflow.add_node("professor", professor_chat_node)
workflow.add_edge(START, "professor")
workflow.add_edge("professor", END)

memory = MemorySaver()
mentor_app = workflow.compile(checkpointer=memory)
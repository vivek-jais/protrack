import os
import requests
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from typing_extensions import TypedDict

# LangGraph & LangChain Imports
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from mentor_agent import mentor_app
# ==========================================
# 0. SETUP GEMINI LLM
# ==========================================
# IMPORTANT: Ensure your environment variable is set in your terminal before running:
# export GOOGLE_API_KEY="your_api_key_here"
# Or explicitly set it here for testing:
# os.environ["GOOGLE_API_KEY"] = "AIzaSy..."
load_dotenv()
#this gemini-2.5-flash is avialable in place of 1.5flash
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2)

# ==========================================
# 1. STRICT PYDANTIC SCHEMAS
# ==========================================
class StageSchema(BaseModel):
    stageName: str = Field(description="Name of the stage (e.g., Planning, Frontend, Backend)")
    deadline: str = Field(description="Strict deadline for this specific stage (YYYY-MM-DD)")
    maxMarks: int = Field(description="Maximum marks for this stage")

class ProjectSchema(BaseModel):
    title: str = Field(description="Title of the project")
    startDate: str = Field(description="Start date of the project (YYYY-MM-DD)")
    deadline: str = Field(description="Overall deadline of the project (YYYY-MM-DD)")
    description: str = Field(description="AI generated engaging and detailed description of the project")
    totalMarks: int = Field(description="Total marks for the entire project")
    stages: List[StageSchema] = Field(description="List of project stages")
    missing_critical_info: List[str] = Field(description="List missing info. ONLY flag if 'title', 'totalMarks', or timelines are completely un-guessable.")

# ==========================================
# 2. LANGGRAPH STATE DEFINITION
# ==========================================
class ProjectBuilderState(TypedDict):
    teacher_prompt: str
    feedback: Optional[str]
    project_draft: Optional[Dict[str, Any]]
    status: str 

# ==========================================
# 3. AI NODE LOGIC
# ==========================================
def analyze_and_draft(state: ProjectBuilderState):
    """Analyzes prompt/feedback, generates the structured draft, and syncs with manual edits."""
    
    # Use feedback if provided, otherwise use the initial prompt
    prompt = state.get("feedback") or state.get("teacher_prompt", "No prompt provided.")
    current_draft = state.get("project_draft", {})
    
    system_msg = f"""
    You are an expert AI Project Architect assisting a teacher.
    Your goal is to draft or revise a project curriculum schema.
    also if start date is not mentioned take the date as of current date of the system
    
    Current Draft State (this may include manual edits by the teacher): 
    {current_draft}
    
    RULES:
    1. Update the Current Draft based on the teacher's new prompt/feedback.
    2. If the user doesn't specify a startDate, assume it starts TODAY.
    3. If the user doesn't specify an overall deadline, assume a standard 1-month timeframe.
    4. If 'stages' are missing, generate 3 logical stages (e.g., Planning, Implementation, Final Review) and distribute the totalMarks and dates evenly.
    5. Only populate 'missing_critical_info' if the human's prompt is completely nonsensical or missing the core topic entirely.
    """
    
    # Force Gemini to output exactly our Pydantic Schema
    structured_llm = llm.with_structured_output(ProjectSchema)
    result = structured_llm.invoke([
        SystemMessage(content=system_msg), 
        HumanMessage(content=prompt)
    ])
    
    # Convert Pydantic model to dictionary
    draft_dict = result.dict()
    
    # 🔥 FORCE GitHub Repo to always be True, regardless of what AI thinks
    draft_dict["github_repository"] = True
    
    # Determine the status for the frontend HITL (Human In The Loop)
    status = "awaiting_input" if draft_dict.get("missing_critical_info") else "reviewing"
    
    return {
        "project_draft": draft_dict,
        "status": status,
        "feedback": None # Reset feedback so it doesn't loop infinitely
    }

# ==========================================
# 4. BUILD & COMPILE GRAPH WITH MEMORY
# ==========================================
workflow = StateGraph(ProjectBuilderState)
workflow.add_node("draft_generator", analyze_and_draft)

workflow.add_edge(START, "draft_generator")
workflow.add_edge("draft_generator", END)

# MemorySaver allows the graph to maintain conversation history via thread_id
memory = MemorySaver()
project_builder_app = workflow.compile(checkpointer=memory)

# ==========================================
# 5. FASTAPI SERVER & ENDPOINTS
# ==========================================
app = FastAPI(title="ProTrack AI Architect")

# Allow Next.js frontend to communicate with this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Models ---
class GraphRequest(BaseModel):
    thread_id: str
    text: str
    current_draft: Optional[dict] = None  # Accepts manual frontend edits

class SaveRequest(BaseModel):
    draft: dict

class MentorChatRequest(BaseModel):
    thread_id: str
    message: str
    student_profile: Dict[str, Any] # e.g., {"name": "Alex", "skills": ["React", "Python"]}
    project_context: Optional[str] = None 
    resume_context: Optional[str] = None       

@app.post("/api/mentor/chat")
async def chat_with_professor(req: MentorChatRequest):
    """Endpoint for the Student-Professor Chatbot."""
    
    # The thread_id is crucial: it tells LangGraph to fetch this specific student's chat history!
    config = {"configurable": {"thread_id": req.thread_id}}
    
    # Format the input for LangGraph
    input_data = {
        "messages": [("user", req.message)], # Wrap the new message as a user message
        "student_profile": req.student_profile,
        "project_context": req.project_context,
        "resume_context": req.resume_context
    }
    
    # Invoke the isolated Professor Agent
    result = mentor_app.invoke(input_data, config=config)
    
    # Extract the very last message (the AI's response) from the updated state
    ai_response = result["messages"][-1].content
    
    return {"response": ai_response}

# --- Routes ---
@app.post("/api/builder/chat")
async def chat_with_builder(req: GraphRequest):
    """Handles prompt/feedback AND syncs manual UI edits with AI memory."""
    config = {"configurable": {"thread_id": req.thread_id}}
    
    # 1. Fetch current state
    current_state = project_builder_app.get_state(config)
    
    # 2. Sync manual UI edits: If the frontend sends a draft, overwrite the AI's memory
    if req.current_draft:
        project_builder_app.update_state(config, {"project_draft": req.current_draft})

    # 3. Determine if this is a new prompt or feedback on an existing draft
    if current_state.values:
        input_data = {"feedback": req.text}
    else:
        input_data = {"teacher_prompt": req.text, "status": "drafting"}
        
    # 4. Invoke the LangGraph agent
    result = project_builder_app.invoke(input_data, config=config)
    
    return {
        "draft": result.get("project_draft"), 
        "status": result.get("status")
    }

@app.post("/api/builder/save")
async def save_to_nextjs(req: SaveRequest):
    """Python acts as a microservice, forwarding the final draft to the Next.js Database API."""
    try:
        # NOTE: Ensure this URL exactly matches your Next.js project creation route
        nextjs_url = "http://localhost:3000/api/project"
        
        response = requests.post(nextjs_url, json=req.draft)
        
        # Throw an exception if Next.js returns an error status code (e.g., 400, 500)
        response.raise_for_status() 
        
        return {"message": "Project saved successfully via Next.js", "data": response.json()}
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to communicate with Next.js DB API: {str(e)}")

# ==========================================
# 6. RUN SERVER
# ==========================================
if __name__ == "__main__":
    # Run the server on port 8000
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
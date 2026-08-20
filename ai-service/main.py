import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

load_dotenv()

app = FastAPI(title="ProofBridge AI Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not configured")

client = genai.Client(api_key=api_key)


class AnalysisRequest(BaseModel):
    text: str


class ActionPlanRequest(BaseModel):
    analysis: str


class ChatRequest(BaseModel):
    message: str
    context: dict = {}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ProofBridge AI Service",
    }


@app.post("/analyze")
def analyze_document(request: AnalysisRequest):
    try:
        prompt = f"""
You are an AI evidence analysis assistant for ProofBridge.

Analyze the following document and return:

1. Key evidence/facts
2. Important issues or risks
3. Missing information
4. Recommended next actions

Document:
{request.text}
"""

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
        )

        return {"analysis": response.text}

    except Exception as error:
        print("GEMINI ERROR:", repr(error))
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/action-plan")
def generate_action_plan(request: ActionPlanRequest):
    try:
        prompt = f"""
You are an AI action-plan assistant for ProofBridge.

Based on the following evidence analysis, generate a practical action plan.

Return:
1. Immediate actions
2. Required documents or evidence
3. Responsible party
4. Priority
5. Suggested deadline

Evidence Analysis:
{request.analysis}
"""

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
        )

        return {"actionPlan": response.text}

    except Exception as error:
        print("GEMINI ACTION PLAN ERROR:", repr(error))
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/chat")
def chat_with_assistant(request: ChatRequest):
    try:
        context = request.context or {}
        case_title = context.get("caseTitle", "Unknown case")
        analysis = context.get("latestAnalysis", "No analysis yet")
        plan = context.get("actionPlan", "No action plan yet")

        prompt = f"""
You are ProofBridge AI Voice Assistant — a helpful case management assistant.

Case: {case_title}

Latest Evidence Analysis:
{analysis}

Action Plan:
{plan}

User question: {request.message}

Respond concisely and helpfully. Focus on evidence gaps, next steps, and case resolution.
Keep responses under 200 words unless more detail is explicitly requested.
"""

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
        )

        return {"reply": response.text}

    except Exception as error:
        print("GEMINI CHAT ERROR:", repr(error))
        raise HTTPException(status_code=500, detail=str(error))

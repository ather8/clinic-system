import google.generativeai as genai
from django.conf import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

MODEL_NAME = 'gemini-2.0-flash'


def generate_summary(report_text: str) -> str:
    model = genai.GenerativeModel(MODEL_NAME)
    prompt = (
        "You are a clinical assistant. Summarize the following medical report "
        "into a short, structured summary with clear sections: "
        "Chief Complaint, Findings, Diagnosis (if stated), and Recommendations. "
        "Keep it concise and use plain clinical language.\n\n"
        f"Report:\n{report_text}"
    )
    response = model.generate_content(prompt)
    return response.text


DEPARTMENTS = [
    'General Medicine', 'Cardiology', 'Pulmonology', 'Gastroenterology',
    'Orthopedics', 'Dermatology', 'ENT', 'Neurology', 'Pediatrics',
    'Gynecology', 'Psychiatry', 'Emergency',
]

TRIAGE_SYSTEM_PROMPT = (
    "You are a friendly, careful triage assistant for a small clinic. "
    "Ask short, focused follow-up questions to understand the patient's symptoms — "
    "one or two questions at a time, not a long list. "
    "Once you have enough information (usually after 2-4 exchanges), "
    "suggest which department they should see, chosen from this list: "
    f"{', '.join(DEPARTMENTS)}. "
    "Always include a clear disclaimer that this is not a diagnosis and, "
    "for anything urgent or severe (chest pain, difficulty breathing, "
    "severe bleeding, loss of consciousness), tell them to seek emergency care immediately. "
    "Keep responses brief and conversational."
)


def chat_reply(history: list[dict]) -> str:
    """
    history: list of {"role": "user"|"assistant", "content": "..."}
    in chronological order (oldest first).
    """
    model = genai.GenerativeModel(MODEL_NAME, system_instruction=TRIAGE_SYSTEM_PROMPT)

    # Gemini's chat history format uses 'model' instead of 'assistant'
    gemini_history = [
        {
            'role': 'model' if turn['role'] == 'assistant' else 'user',
            'parts': [turn['content']],
        }
        for turn in history[:-1]
    ]

    chat = model.start_chat(history=gemini_history)
    response = chat.send_message(history[-1]['content'])
    return response.text


def extract_department_suggestion(reply_text: str) -> str:
    """Lightweight heuristic: check if the reply mentions a known department."""
    for dept in DEPARTMENTS:
        if dept.lower() in reply_text.lower():
            return dept
    return ''
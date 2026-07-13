from google import genai
from google.genai import types
from django.conf import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

MODEL_NAME = 'gemini-2.0-flash'


def generate_summary(report_text: str) -> str:
    prompt = (
        "You are a clinical assistant. Summarize the following medical report "
        "into a short, structured summary with clear sections: "
        "Chief Complaint, Findings, Diagnosis (if stated), and Recommendations. "
        "Keep it concise and use plain clinical language.\n\n"
        f"Report:\n{report_text}"
    )
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )
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
    in chronological order (oldest first). The last item is the new user message.
    """
    # New SDK also uses 'model' instead of 'assistant' for the AI's turns
    genai_history = [
        types.Content(
            role='model' if turn['role'] == 'assistant' else 'user',
            parts=[types.Part(text=turn['content'])],
        )
        for turn in history[:-1]
    ]

    chat = client.chats.create(
        model=MODEL_NAME,
        config=types.GenerateContentConfig(system_instruction=TRIAGE_SYSTEM_PROMPT),
        history=genai_history,
    )
    response = chat.send_message(history[-1]['content'])
    return response.text


def extract_department_suggestion(reply_text: str) -> str:
    for dept in DEPARTMENTS:
        if dept.lower() in reply_text.lower():
            return dept
    return ''
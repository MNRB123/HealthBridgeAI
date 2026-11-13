"""
OpenAI GPT-4o integration for Mental Wellness chat.

Safety controls:
- Crisis keyword detection triggers immediate 988 referral
- System prompt enforces non-medical, supportive role
- Messages are stored with crisis flag for review
- Max context window: last 10 messages to control cost
"""
import re
from typing import List, Dict
from openai import AsyncOpenAI
from app.core.config import settings

# Client initialized lazily so missing key doesn't crash on import
_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


CRISIS_PATTERNS = re.compile(
    # No trailing \b on purpose: "suicid" must also match "suicidal"/"suicide".
    r"\b(suicid|kill myself|end my life|end it all|want to die|wanna die|hurt myself|"
    r"self[- ]?harm|harm myself|cut myself|can't go on|no reason to live|"
    r"better off dead|overdose|hang myself|jump (off|from))",
    re.IGNORECASE,
)

SYSTEM_PROMPT = """You are HealthBridge Wellness AI, a compassionate mental wellness companion.

Your role:
- Listen empathetically and validate feelings
- Offer evidence-based coping suggestions (breathing, grounding, journaling)
- Encourage professional help when appropriate
- Provide information about free mental health resources in the US

Important rules:
- You are NOT a therapist, psychiatrist, or medical professional
- Never diagnose, prescribe, or provide clinical advice
- Always remind users to seek professional help for serious concerns
- If a user expresses crisis or suicidal ideation, ALWAYS refer them to 988 (Suicide & Crisis Lifeline)
- Keep responses concise (under 150 words) unless the user needs detailed guidance
- Be warm, non-judgmental, and human

If you detect crisis language, immediately respond with:
"I'm very concerned about what you're sharing. Please reach out to the 988 Suicide & Crisis Lifeline right now — call or text 988. They have trained counselors available 24/7, and they care about you. You don't have to face this alone."
"""


def is_crisis_message(text: str) -> bool:
    return bool(CRISIS_PATTERNS.search(text))


CRISIS_RESPONSE = (
    "I'm very concerned about what you're sharing. Please reach out to the "
    "988 Suicide & Crisis Lifeline right now — call or text **988**. "
    "They have trained counselors available 24/7, and they care about you. "
    "You don't have to face this alone. 💙"
)


async def get_ai_response(
    user_message: str,
    history: List[Dict[str, str]],
) -> tuple[str, bool]:
    """
    Returns (response_text, is_crisis_flagged).
    Crisis check happens before calling the API.
    """
    crisis = is_crisis_message(user_message)
    if crisis:
        return CRISIS_RESPONSE, True

    if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY.startswith("sk-your"):
        # No real API key — return a helpful demo fallback
        return (
            "Thank you for sharing that. I'm here to listen and support you. "
            "(Note: AI responses require a valid OpenAI API key configured in .env) "
            "In the meantime, you can try the Breathing Exercise tab or browse the Resources tab for support.",
            False,
        )

    # Keep last 10 exchanges to manage token cost
    trimmed_history = history[-10:] if len(history) > 10 else history

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(trimmed_history)
    messages.append({"role": "user", "content": user_message})

    try:
        client = get_client()
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,          # type: ignore[arg-type]
            max_tokens=300,
            temperature=0.75,
        )
        reply = response.choices[0].message.content or ""
        # Secondary crisis check on AI response (defensive)
        reply_crisis = is_crisis_message(reply)
        return reply.strip(), reply_crisis
    except Exception as exc:
        return f"I'm having trouble connecting right now. Please try again in a moment. ({type(exc).__name__})", False

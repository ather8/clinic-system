import pytesseract
from PIL import Image
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .services import generate_summary, chat_reply, extract_department_suggestion
from django.shortcuts import get_object_or_404
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer
import logging

logger = logging.getLogger(__name__)


pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD


class OCRExtractView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            image = Image.open(file)
            text = pytesseract.image_to_string(image)
        except Exception as e:
            logger.error(f'AI request failed: {e}')  # full detail goes to server logs, not the user
            return Response(
                {'detail': "We couldn't reach the AI assistant right now. Please try again in a moment."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({'extracted_text': text.strip()})


class SummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        report_text = request.data.get('report_text', '').strip()
        if not report_text:
            return Response({'detail': 'report_text is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not settings.GEMINI_API_KEY:
            return Response({'detail': 'AI summarization is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            summary = generate_summary(report_text)
        except Exception as e:
            logger.error(f'AI request failed: {e}')  # full detail goes to server logs, not the user
            return Response(
                {'detail': "We couldn't reach the AI assistant right now. Please try again in a moment."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({'summary': summary})


class ChatSessionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user)
        return Response(ChatSessionSerializer(sessions, many=True).data)

    def post(self, request):
        session = ChatSession.objects.create(user=request.user)
        return Response(ChatSessionSerializer(session).data, status=status.HTTP_201_CREATED)


class ChatMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        session = get_object_or_404(ChatSession, id=session_id, user=request.user)

        user_text = request.data.get('message', '').strip()
        if not user_text:
            return Response({'detail': 'message is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not settings.GEMINI_API_KEY:
            return Response({'detail': 'AI chatbot is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        ChatMessage.objects.create(session=session, role='user', content=user_text)

        history = list(session.messages.values('role', 'content'))

        try:
            reply_text = chat_reply(history)
        except Exception as e:
            logger.error(f'AI request failed: {e}')  # full detail goes to server logs, not the user
            return Response(
                {'detail': "We couldn't reach the AI assistant right now. Please try again in a moment."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        ChatMessage.objects.create(session=session, role='assistant', content=reply_text)

        dept = extract_department_suggestion(reply_text)
        if dept:
            session.department_suggestion = dept
        session.save()  # bumps updated_at regardless, for session "freshness" tracking

        return Response(ChatSessionSerializer(session).data)
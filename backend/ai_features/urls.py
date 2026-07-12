from django.urls import path
from .views import OCRExtractView, SummaryView
from .views import ChatSessionListCreateView, ChatMessageView

urlpatterns = [
    path('ocr/extract/', OCRExtractView.as_view(), name='ocr-extract'),
    path('summary/', SummaryView.as_view(), name='ai-summary'),
    path('chat/sessions/', ChatSessionListCreateView.as_view(), name='chat-sessions'),
    path('chat/sessions/<int:session_id>/messages/', ChatMessageView.as_view(), name='chat-message'),
]
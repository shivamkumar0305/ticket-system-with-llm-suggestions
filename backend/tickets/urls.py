from django.urls import path
from .views import (
    ticket_list_create,
    ticket_detail,
    ticket_stats,
    classify_ticket
)

urlpatterns = [
    path('tickets/', ticket_list_create),
    path('tickets/<int:pk>/', ticket_detail),
    path('tickets/stats/', ticket_stats),
    path('tickets/classify/', classify_ticket),
]

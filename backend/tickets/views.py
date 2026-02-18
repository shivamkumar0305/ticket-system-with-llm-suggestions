import os
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from .models import Ticket
from .serializers import TicketSerializer
import anthropic


@api_view(['GET', 'POST'])
def ticket_list_create(request):
    if request.method == 'GET':
        queryset = Ticket.objects.all()  # already ordered by -created_at from Meta

        # filters
        category = request.query_params.get('category')
        priority = request.query_params.get('priority')
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search')

        if category:
            queryset = queryset.filter(category=category)
        if priority:
            queryset = queryset.filter(priority=priority)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        serializer = TicketSerializer(queryset, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = TicketSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
def ticket_detail(request, pk):
    try:
        ticket = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist:
        return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = TicketSerializer(ticket, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def ticket_stats(request):
    total = Ticket.objects.count()
    open_count = Ticket.objects.filter(status='open').count()

    # avg tickets per day — look at last 30 days
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_count = Ticket.objects.filter(created_at__gte=thirty_days_ago).count()
    avg_per_day = round(recent_count / 30, 1)

    priority_breakdown = dict(
        Ticket.objects.values('priority')
        .annotate(count=Count('id'))
        .values_list('priority', 'count')
    )

    category_breakdown = dict(
        Ticket.objects.values('category')
        .annotate(count=Count('id'))
        .values_list('category', 'count')
    )

    return Response({
        'total_tickets': total,
        'open_tickets': open_count,
        'avg_tickets_per_day': avg_per_day,
        'priority_breakdown': priority_breakdown,
        'category_breakdown': category_breakdown,
    })


@api_view(['POST'])
def classify_ticket(request):
    description = request.data.get('description', '').strip()
    if not description:
        return Response({'error': 'description is required'}, status=status.HTTP_400_BAD_REQUEST)

    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        return Response({'error': 'LLM not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=100,
            messages=[
                {
                    'role': 'user',
                    'content': f"""You are a support ticket classifier. Given a ticket description, return ONLY a JSON object with two fields: category and priority. Nothing else — no explanation, no markdown.

Categories: billing, technical, account, general
Priorities: low, medium, high, critical

Rules:
- billing: payment, invoice, charge, refund, subscription
- technical: bug, error, crash, not working, broken, slow
- account: login, password, access, profile, permissions
- general: everything else
- critical: system down, data loss, security breach
- high: major feature broken, many users affected
- medium: feature partially working, workaround exists
- low: minor issue, cosmetic, question

Description: {description}

Respond with only this format:
{{"category": "...", "priority": "..."}}"""
                }
            ]
        )

        import json
        result = json.loads(message.content[0].text)

        # validate the LLM didn't return garbage
        valid_categories = ['billing', 'technical', 'account', 'general']
        valid_priorities = ['low', 'medium', 'high', 'critical']

        if result.get('category') not in valid_categories:
            result['category'] = 'general'
        if result.get('priority') not in valid_priorities:
            result['priority'] = 'medium'

        return Response({
            'suggested_category': result['category'],
            'suggested_priority': result['priority'],
        })

    except Exception:
        # graceful fallback — LLM failed, return defaults
        return Response({
            'suggested_category': 'general',
            'suggested_priority': 'medium',
        })
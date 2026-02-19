from django.views.decorators.csrf import csrf_exempt
import os
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from .models import Ticket
from .serializers import TicketSerializer
import requests
import json
import re

@csrf_exempt
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
    
    
    api_key = os.environ.get('OPENAI_API_KEY')
    print(f"API KEY EXISTS: {bool(api_key)}")

    if not description:
        return Response(
            {'error': 'description is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    api_key = os.environ.get('OPENAI_API_KEY')

    if not api_key:
        return Response({
            'suggested_category': 'general',
            'suggested_priority': 'medium',
        })

    try:
        prompt = f"""
You are a support ticket classifier.

Return ONLY valid JSON with exactly two fields:
- category: billing | technical | account | general
- priority: low | medium | high | critical

Rules:
- billing → payment, invoice, refund, subscription
- technical → bug, error, crash, broken, slow
- account → login, password, access, permissions
- general → everything else
- critical → system down, data loss, security issue
- high → major feature broken
- medium → partial issue, workaround exists
- low → minor issue or question

Description:
{description}

Return ONLY:
{{"category": "...", "priority": "..."}}
"""

        url = "https://api.openai.com/v1/chat/completions"

        payload = {
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 100
        }

        response = requests.post(
            url,
            json=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        raw_text = response.json()['choices'][0]['message']['content'].strip()

        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if not match:
            raise ValueError("Invalid JSON from LLM")

        result = json.loads(match.group())

        valid_categories = ['billing', 'technical', 'account', 'general']
        valid_priorities = ['low', 'medium', 'high', 'critical']

        category = result.get('category', 'general')
        priority = result.get('priority', 'medium')

        if category not in valid_categories:
            category = 'general'
        if priority not in valid_priorities:
            priority = 'medium'

        return Response({
            'suggested_category': category,
            'suggested_priority': priority,
        })

    except Exception as e:
        print(f"CLASSIFY ERROR: {e}")  # this will show in Docker logs
        return Response({
        'suggested_category': 'general',
        'suggested_priority': 'medium',
        })
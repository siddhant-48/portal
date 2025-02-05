"""nitoronlinetestportal URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path

from questions.views import *

urlpatterns = [
    path('dashboard/', dashboard),
    path('questions/', get_question_list),
    path('add_question/', add_question, name='add_question'),
    path('bulk_questions/', bulk_questions, name='bulk_questions'),
    path('delete_question/', delete_question),
    path('question_details/<question_id>/<question_type>/', get_question_details)
]

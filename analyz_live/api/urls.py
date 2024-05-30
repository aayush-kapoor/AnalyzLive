from django.urls import path, include
from .views import KeywordSearchView

urlpatterns = [
    path('keywords/search/', KeywordSearchView.as_view(), name='keyword-search'),
]


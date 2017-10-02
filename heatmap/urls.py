from django.conf.urls import url

from . import views


urlpatterns = [
    url(r"$^", views.index),
    url(r"^tree", views.tree),
    url(r"^heatmap", views.heatmap)
]

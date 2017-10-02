from django.shortcuts import render


def index(request):
    """Render the index page."""

    return render(request, "heatmap/index.html")

def tree(request):
    """Render the tree page."""

    return render(request, "heatmap/tree.html")

def heatmap(request):
    """Render the heatmap page."""

    return render(request, "heatmap/heatmap.html")

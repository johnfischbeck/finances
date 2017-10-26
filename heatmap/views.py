from django.shortcuts import render, redirect


def index(request):
    """Render the index page."""

    return render(request, "heatmap/index.html")

def data(request):
    # TODO: Add filtering
    return redirect('/static/data/heatmap/heatmap.json')

from django.shortcuts import render, redirect


def index(request):
    """Render the index page."""

    return render(request, "treemap/index.html")


def data(request):
    return redirect('/static/data/treemap.csv')

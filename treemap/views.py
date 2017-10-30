from django.shortcuts import render, redirect


def index(request):
    """Render the index page."""

    return render(request, "treemap/index.html")


def data(request):
    return redirect('/static/data/treemap.csv')
    # Various rendering ordering options
    order=[['party', 'state', 'district'], ['state', 'district', 'party']]

    # Return the rendered page
    rpl = {"order":str(order).replace("None","null")}
    return render(request, "treemap/index.html", rpl)

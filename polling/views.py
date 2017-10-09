from django.shortcuts import render


def index(request):
    """Render the index page."""

    # Build a list of race options (name/year/type/state/district/csv)
    options = ["2004 presidential election/2004/pres/null/null/2004pres.csv",\
               "2008 presidential election/2008/pres/null/null/2008pres.csv"]
    
    # Render the page
    print(str(options))
    ctx = {"options":str(options)}
    return render(request, "polling/index.html", ctx)

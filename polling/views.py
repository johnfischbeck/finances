from django.shortcuts import render


def index(request):
    """Render the index page."""

    # Whether or not a race was packed - TO DO: tell this from HTTP options
    race_picked = False

    # Need to pick race
    if not race_picked:
        # Build a list of race options (name/year/type/state/district)
        options = ["2004 presidential election/2004/pres/null/null"]
        
        # Render the page
        print(str(options))
        ctx = {"options":str(options)}
        return render(request, "polling/index.html", ctx)
    else:
        raise Exception("Illegal state")

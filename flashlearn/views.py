from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django import forms
from .models import *
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt
from django.utils.crypto import get_random_string
import json
import re

privList = ["all", "friends", "private"]


def create_view(request):
    print(request.method)
    print(request.user.is_authenticated)
    if request.method == "POST" and request.user.is_authenticated:
        try:
            # Allow for repeated names
            data = json.loads(request.body)
            name = data["name"]
            description = data["description"]
            cat = data["categories"]
            privacy = data["privacy"]
            cards = data["cards"]

            if len(name) == 0 or privacy not in privList or len(cards) == 0:
                return JsonResponse({"error": "problem adding new pack"}, status=201)
            packId = "p" + get_random_string(6)
            while (Packs.objects.filter(packId=packId)):
                packId = "p" + get_random_string(6)
            numCards = len(cards)
            creator = User.objects.get(id=request.user.id)
            avg_difficulty = 0
            for card in cards:
                if card["difficulty"] == "Easy":
                    avg_difficulty += 1
                elif card["difficulty"] == "Medium":
                    avg_difficulty += 2
                elif card["difficulty"] == "Hard":
                    avg_difficulty += 3
            avg_difficulty = round(avg_difficulty / numCards, 2)
            pack = Packs(name=name, packId=packId, cards=numCards, privacy=privacy,
                         description=description, category=cat, creator=creator, avg_difficulty=avg_difficulty)
            pack.save()
            for card in cards:
                newCard = Cards(pack=pack, question=card["question"], difficulty=card["difficulty"],
                                answer=card["answer"], hint=card["hint"], image=card["image"])
                newCard.save()
            return HttpResponseRedirect(reverse('pack', args=(packId,)))
        except:
            return JsonResponse({"error", "Something went wrong"}, status=201)
    else:
        categories = Category.objects.all().values_list("name")
        return render(request, "flashlearn/create.html", {
            "categories": categories
        })


def profile_view(request):
    return render(request, "flashlearn/profile.html", {
        "list": [1, 2, 3, 4, 5, 6, 7]
    })


def pack_view(request, pack_id,  profile=None):
    if profile:
        return HttpResponseRedirect(f"/{pack_id}")
    print(pack_id)
    return render(request, "flashlearn/pack.html", {
        "cards": [1, 2, 3, 4, 5]
    })


def tutorial_view(request):
    return render(request, "flashlearn/tutorial.html")


def searchPacks(data):
    queryString = data.get("queryString")
    if not queryString:
        return JsonResponse({"error": "invalid query String"}, status=201)
    # Extract information out of the query string
    tokens = [string for string in queryString.strip().split(" ")
              if string]

    allPacks = Packs.objects.all()
    packs = None
    for token in tokens:
        username = allPacks.filter(creator__username__icontains=token)
        packname = allPacks.filter(name__icontains=token)
        packId = allPacks.filter(packId__icontains=token)
        description = allPacks.filter(description__icontains=token)
        if (packs == None):
            packs = username.union(packname).union(
                packId).union(description)
        else:
            packs.union(username).union(packname).union(
                packId).union(description)
    return packs


def search_pages_view(request, page):
    if request.method == "POST":
        data = json.loads(request.body)
        packs = searchPacks(data)
        if packs == None:
            return JsonResponse({"error": "Something went wrong while finding"}, status=201)
        if len(packs) <= 10:
            return JsonResponse({"packs": [pack.serialize() for pack in packs], "more": False}, status=201)
        else:
            if page == 1:
                return JsonResponse({"packs": [pack.serialize() for pack in packs[:10]], "more": True}, status=201)
            else:
                return JsonResponse({"packs": [pack.serialize() for pack in packs[(page-1)*10: page*10]], "more": True}, status=201)


def fs_pages_view(request, page):
    if request.method == "POST":
        data = json.loads(request.body)
        packs = searchPacks(data)
        cat = data.get("cat")
        time = data.get("time")
        sort = data.get("sort")
        direction = data.get("direction")
        if cat:
            packs = packs.filter(category=cat)
        if time:
            packs = packs.filter()
        if sort:
            if direction:
                packs = packs.order_by(
                    sort) if direction == "up" else packs.order_by("-" + sort)
            else:
                packs = packs.order_by("-" + sort)
        if len(packs) <= 10:
            return JsonResponse({"packs": [pack.serialize() for pack in packs], "more": False}, status=201)
        else:
            if page == 1:
                return JsonResponse({"packs": [pack.serialize() for pack in packs[:10]], "more": True}, status=201)
            else:
                return JsonResponse({"packs": [pack.serialize() for pack in packs[(page-1)*10: page*10]], "more": True}, status=201)


def index_pages_view(request, page):
    if request.method == "GET":
        packs = Packs.objects.all().order_by(
            '-creation_time')
        if len(packs) <= 10:
            return JsonResponse({"packs": [pack.serialize() for pack in packs], "more": False}, status=201)
        else:
            if page == 1:
                return JsonResponse({"packs": [pack.serialize() for pack in packs[:10]], "more": True}, status=201)
            else:
                return JsonResponse({"packs": [pack.serialize() for pack in packs[(page-1)*10: page*10]], "more": True}, status=201)


def index(request):
    categories = Category.objects.all().values_list("name")
    return render(request, "flashlearn/index.html", {
        "categories": categories
    })

# Handle requests only for the badge on top


def friends_badge_view(request, type):
    if type == "pending" and request.user.is_authenticated:
        pendings = User.objects.get(id=request.user.id).requests.all()
        return JsonResponse({"count": len(pendings)}, status=201)


def friends_view(request):
    if request.user.is_authenticated:
        friends = User.objects.get(id=request.user.id).friends.all()
        return render(request, "flashlearn/friends.html", {
            "friends": friends
        })
    else:
        return HttpResponseRedirect(reverse("index"))


def register_view(request):
    if request.method == "POST":
        toSend = {}
        username = request.POST["username"]
        email = request.POST["email"]
        if User.objects.filter(email=email).exists():
            toSend["ev"] = False
        else:
            toSend["ev"] = True
        # Ensure password matches confirmation
        password = request.POST["password"]
        if not re.match(r"^(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z]).{6,}$", password):
            toSend["pv"] = False
        else:
            toSend["pv"] = True
        # Attempt to create new user
        try:
            if not toSend["ev"] or not toSend["pv"]:
                toSend["uv"] = True
                return render(request, "flashlearn/register.html", toSend)
            # 2 users cannot have the same username
            userId = get_random_string(length=6)
            while (User.objects.filter(userId=userId)):
                userId = get_random_string(length=6)
            print(userId)
            user = User.objects.create_user(
                username=username, email=email, password=password, userId=userId)
            user.save()
        except IntegrityError:
            toSend["uv"] = False
            return render(request, "flashlearn/register.html", toSend)
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "flashlearn/register.html", {
            "uv": True,
            "ev": True,
            "pv": True,
        })


def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        print("hello ther")
        user = authenticate(request, username=username, password=password)
        print("hello here")
        # Check if authentication successful
        if user is not None:
            print("can we get here?")
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            print("byebye")
            return render(request, "flashlearn/login.html", {
                "login_valid": False
            })
    else:
        return render(request, "flashlearn/login.html", {
            "login_valid": True
        })


def logout_view(request):
    if request.user.is_authenticated:
        logout(request)
        return HttpResponseRedirect(reverse("index"))

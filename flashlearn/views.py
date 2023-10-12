from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django import forms
from .models import User
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt
import json
import re


def create_view(request):
    return render(request, "flashlearn/create.html")


def profile_view(request):
    return render(request, "flashlearn/profile.html", {
        "list": [1, 2, 3, 4, 5, 6, 7]
    })


def pack_view(request, pack_id,  profile=None):
    if profile:
        return HttpResponseRedirect(f"/{pack_id}")
    print(pack_id)
    return render(request, "flashlearn/pack.html", {
        "frog": pack_id
    })


def tutorial_view(request):
    return render(request, "flashlearn/tutorial.html")


def index(request):
    return render(request, "flashlearn/index.html", {
        "list": [1, 2, 3, 4, 5, 6, 7]
    })


def friends_view(request):
    if request.user.is_authenticated:
        return render(request, "flashlearn/friends.html")
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
            user = User.objects.create_user(username, email, password)
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
    print("hello123")
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

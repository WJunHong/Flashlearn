from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .models import *
from django.utils.crypto import get_random_string
import json
import re
from datetime import datetime, timedelta, timezone
import os
import plotly.express as px
import plotly.offline as opy
import plotly.graph_objects as go
import pandas as pd

privList = ["all", "friends", "private"]

privObj = {
    "all": "A",
    "friends": "F",
    "private": "P"
}

difficulty_mapper = {
    "E": 1,
    "M": 2,
    "H": 3
}


def create_view(request):
    print(request.method)
    print(request.user.is_authenticated)
    if request.method == "POST" and request.user.is_authenticated:
        try:
            # Allow for repeated names
            data = request.POST
            name = data.get("name")
            description = data.get("description")
            cat = data.get("categories")
            privacy = data.get("privacy")
            count = data.get("count")

            if len(name) == 0 or privacy not in privList:
                return JsonResponse({"error": "problem adding new pack"}, status=201)
            privacy = privObj[privacy]
            packId = "p" + get_random_string(6)
            while (Packs.objects.filter(packId=packId)):
                packId = "p" + get_random_string(6)
            creator = User.objects.get(id=request.user.id)
            avg_difficulty = 0
            card_count = 0
            card_numbers = []
            for i in range(1, int(count) + 1):
                if data.get("c{0}".format(i)):
                    card = json.loads(data.get("c{0}".format(i)))
                    card_count += 1
                    card_numbers.append(i)
                    d = card.get("difficulty")
                    if d in difficulty_mapper.keys():
                        avg_difficulty += difficulty_mapper[d]

                    else:
                        return JsonResponse({"error": ["problem adding new pack"]}, status=201)

            avg_difficulty = round(avg_difficulty / card_count, 2)
            avg_score = 0
            like_count = 0
            pack = Packs(name=name, packId=packId, cards=card_count, privacy=privacy,
                         description=description, category=(Category.objects.filter(name=cat).first() if cat else None), creator=creator, avg_difficulty=avg_difficulty, avg_score=avg_score, like_count=like_count)
            pack.save()
            for i in card_numbers:
                # Get card values:
                card = json.loads(data.get("c{0}".format(i)))
                q = card.get("question")
                a = card.get("answer")
                h = card.get("hint")
                d = card.get("difficulty")
                i = request.FILES.get("i{0}".format(i))
                if len(q) == 0 or len(a) == 0:
                    return JsonResponse({"error": ["problem adding new pack"]}, status=201)

                newCard = Cards(pack=pack, question=q, difficulty=d,
                                answer=a, hint=h, image=i)
                newCard.save()
            return JsonResponse({"success": True, "packId": packId}, status=201)
        except Exception as e:
            print(e)
            return JsonResponse({"error": ["Something went wrong"]}, status=201)

    else:
        categories = Category.objects.all()
        return render(request, "flashlearn/create.html", {
            "categories": categories
        })


def profile_pack_view(request, profile, type):

    if type == "all":
        packs = Packs.objects.filter(creator__userId=profile).all()
        return JsonResponse({"packs": [pack.serialize() for pack in packs]}, status=201)
    elif type == "likes":
        # Assuming you have a profile User instance
        # Replace profile_id with the actual user ID
        profile = User.objects.get(userId=profile)
        likes = Likes.objects.filter(user=profile).all()
        packs = []
        for like in likes:
            packs.append(like.pack)
        return JsonResponse({"packs": [pack.serialize() for pack in packs]}, status=201)

    elif type == "favs":
        if (request.user.is_authenticated):
            profile = User.objects.get(userId=profile)
            favourites = Favourites.objects.filter(
                user=profile).all()
            packs = []
            for f in favourites:
                packs.append(f.pack)
            return JsonResponse({"packs": [pack.serialize() for pack in packs]}, status=201)
        else:
            return JsonResponse({"packs": []}, status=201)

    elif type == "image" and request.method == "POST":
        if (request.user.is_authenticated):
            new_image = request.FILES.get("image")
            user = User.objects.get(id=request.user.id)
            if new_image:
                user.image = new_image
            else:
                os.remove(user.image.path)
                user.image = ''
            user.save()
            return JsonResponse({"successful": True, "user": user.serialize()}, status=201)

        else:
            return JsonResponse({"successful": False}, status=201)


def profile_view(request, profile):
    if profile == "badge":
        return friends_badge_view(request, profile)
    # check if legit profile
    if User.objects.filter(userId=profile):
        profile_user = False
        if request.user.is_authenticated:
            userId = User.objects.get(id=request.user.id).userId
            # same user as profile
            if userId == profile:
                profile_user = True
        user = User.objects.get(userId=profile)
        return render(request, "flashlearn/profile.html", {
            "user": user,
            "profile_user": profile_user,
        })
    else:
        return HttpResponseRedirect(reverse("index"))


def pack_handler_view(request, packId, operation):
    if request.method == "POST":
        if request.user.is_authenticated:
            if operation == "delete":
                confirmation = json.loads(request.body).get("confirm")
                if Packs.objects.filter(creator__id=request.user.id, packId=packId) and confirmation:
                    pack = Packs.objects.filter(
                        creator__id=request.user.id, packId=packId).first()
                    try:
                        # Delete all associated images with the pack
                        cards = Cards.objects.filter(pack=pack).all()
                        print(cards)
                        for card in cards:
                            if card.image:
                                if os.path.isfile(card.image.path):
                                    os.remove(card.image.path)
                        # delete the actual pack
                        pack.delete()
                        return JsonResponse({"success": True}, status=201)
                    except:
                        return JsonResponse({"success": False}, status=201)
            elif operation == "edit":
                data = request.POST
                pack = Packs.objects.filter(
                    creator__id=request.user.id, packId=packId)
                if not pack.exists():
                    return JsonResponse({"success": False}, status=201)
                else:
                    try:
                        pack = pack.first()
                        name = data.get("name")
                        cat = data.get("cat")
                        # Ensure we have a valid Cat
                        if cat and not Category.objects.filter(name=cat).exists():
                            return JsonResponse({"success": False}, status=201)

                        description = data.get("description")
                        privacy = data.get("privacy")
                        # Ensure privacy is represented correctly
                        if privacy not in privList:
                            return JsonResponse({"success": False}, status=201)
                        privacy = privObj[privacy]
                        # Not actual card count
                        card_count = data.get("card_count")
                        # actual card count
                        actual_card_count = 0
                        # new average score
                        # new average difficulty
                        avg_difficulty = 0
                        for card in range(1, int(card_count) + 1):
                            # Actual new / edited card
                            if data.get("c{0}".format(card)):

                                actual_card_count += 1
                                card_data = json.loads(
                                    data.get("c{0}".format(card)))
                                card_img = request.FILES.get(
                                    "i{0}".format(card))
                                # New card
                                c_q = card_data.get("q")
                                c_h = card_data.get("h")
                                c_a = card_data.get("a")
                                c_d = card_data.get("d")
                                avg_difficulty += difficulty_mapper[c_d]
                                c_i = card_img

                                if int(card_data.get("o")) == -1:
                                    if not c_q or not c_a or not c_d:
                                        return JsonResponse({"success": False}, status=201)
                                    else:
                                        new_card = Cards(
                                            pack=pack, question=c_q, hint=c_h, answer=c_a, difficulty=c_d, image=c_i)
                                        new_card.save()

                                # old card
                                else:
                                    existing_card = Cards.objects.filter(
                                        id=card_data.get("o")).first()
                                    existing_card.question = c_q
                                    existing_card.answer = c_a
                                    existing_card.hint = c_h
                                    existing_card.difficulty = c_d
                                    if c_i:
                                        existing_card.image.delete(
                                            save=False)
                                        existing_card.image = c_i
                                    elif not c_i and not card_data.get("i"):
                                        existing_card.image.delete(
                                            save=False)
                                    existing_card.save()
                            # Else I want to delete some old card
                            else:
                                delete_id = data.get("c{0}-".format(card))
                                card_to_delete = Cards.objects.filter(
                                    id=delete_id).first()
                                if not card_to_delete:
                                    return JsonResponse({"success": False}, status=201)
                                else:
                                    card_to_delete.delete()

                        avg_difficulty = round(
                            avg_difficulty / actual_card_count, 2)

                        pack.name = name

                        if cat:
                            pack.category = Category.objects.filter(
                                name=cat).first()
                        elif pack.category:
                            pack.category = None
                        pack.cards = actual_card_count
                        pack.avg_score = 0
                        pack.description = description
                        pack.avg_difficulty = avg_difficulty
                        pack.privacy = privacy

                        plays = Plays.objects.filter(pack=pack).all()
                        for play in plays:
                            play.delete()
                        pack.save()
                        return JsonResponse({"success": True}, status=201)
                    except Exception as e:
                        print(e)
                        return JsonResponse({"success": False}, status=201)
            elif operation == "play":
                score = json.loads(request.body).get("score")
                newPlay = Plays(user=User.objects.get(id=request.user.id),
                                pack=Packs.objects.get(packId=packId), score=score)
                try:
                    newPlay.save()
                    return JsonResponse({"success": True}, status=201)
                except:
                    return JsonResponse({"success": False}, status=201)

            try:
                pack = Packs.objects.get(packId=packId)
                if operation == "addFav":
                    newFav = Favourites(pack=pack,
                                        user=User.objects.get(id=request.user.id))
                    newFav.save()
                    return JsonResponse({"success": True}, status=201)
                elif operation == "removeFav":
                    newFav = Favourites.objects.filter(
                        pack__packId=packId, user__id=request.user.id)
                    if newFav.exists():
                        newFav.first().delete()
                        return JsonResponse({"success": True}, status=201)
                elif operation == "addLike":
                    print("hello")
                    newLike = Likes(pack=pack,
                                    user=User.objects.get(id=request.user.id))
                    existingDislike = Dislikes.objects.filter(
                        pack__packId=packId, user__id=request.user.id)
                    new_like_count = pack.like_count
                    if existingDislike.exists():

                        existingDislike.first().delete()
                        new_like_count += 1
                    newLike.save()
                    new_like_count += 1
                    pack.like_count = new_like_count
                    pack.save()
                    return JsonResponse({"success": True, "new_like_count": new_like_count}, status=201)
                elif operation == "addDislike":
                    newDislike = Dislikes(
                        pack=pack,
                        user=User.objects.get(id=request.user.id))
                    existingLike = Likes.objects.filter(
                        pack__packId=packId, user__id=request.user.id)
                    new_like_count = pack.like_count
                    if existingLike.exists():
                        existingLike.first().delete()
                        new_like_count -= 1
                    newDislike.save()
                    new_like_count -= 1
                    pack.like_count = new_like_count
                    pack.save()
                    return JsonResponse({"success": True, "new_like_count": new_like_count}, status=201)

                elif operation == "removeDislike":
                    existingDislike = Dislikes.objects.filter(
                        pack__packId=packId, user__id=request.user.id)
                    if existingDislike.exists():
                        existingDislike.first().delete()
                        new_like_count = pack.like_count + 1
                        pack.like_count = new_like_count
                        pack.save()
                        return JsonResponse({"success": True, "new_like_count": new_like_count}, status=201)
                    else:
                        return JsonResponse({"success": False}, status=201)
                elif operation == "removeLike":
                    existingLike = Likes.objects.filter(
                        pack__packId=packId, user__id=request.user.id)
                    if existingLike.exists():
                        existingLike.first().delete()
                        new_like_count = pack.like_count - 1
                        pack.like_count = new_like_count
                        pack.save()
                        return JsonResponse({"success": True, "new_like_count": new_like_count}, status=201)
                    else:
                        return JsonResponse({"success": False}, status=201)
            except:
                return JsonResponse({"success": False}, status=201)
        else:
            if operation == "play":
                try:
                    score = json.loads(request.body).get("score")
                    newPlay = Plays(None, pack=Packs.objects.get(
                        packId=packId), score=score)
                    newPlay.save()
                    return JsonResponse({"success": True}, status=201)
                except Exception as e:
                    print(e)
                    return JsonResponse({"success": False}, status=201)

    return JsonResponse({"success": False}, status=201)


def reroute_pack_view(request, pack_id):
    return HttpResponseRedirect(reverse("pack", kwargs={'pack_id': pack_id}))


def pack_view(request, pack_id):

    pack = Packs.objects.filter(packId=pack_id)
    if not len(pack):
        print("pack not found")
        return HttpResponseRedirect(reverse("index"))
    # Get the pack
    pack = Packs.objects.get(packId=pack_id)
    # Get cards for the pack

    all_cards = Cards.objects.filter(pack=pack).order_by("id").all()
    card_num_list = range(1, len(all_cards) + 1)
    cards = zip(card_num_list, all_cards)
    # Get total plays
    total_play_count = len(Plays.objects.filter(pack=pack).all())
    all_plays = Plays.objects.filter(pack=pack).all()
    df = {"Scores": [play.score for play in all_plays]}
    df = pd.DataFrame(df)
    score_plot = px.box(df, y="Scores")
    # Set privacy
    can_play = False

    if pack.privacy == "A":
        can_play = True

    # Get Likes / dislikes by user
    if request.user.is_authenticated:
        if pack.privacy == "F":
            is_friend = Friends.objects.filter(
                user__id=request.user.id, friend=pack.creator).exists()
            can_play = is_friend
        is_creator = pack.creator.id == request.user.id
        liked = Likes.objects.filter(
            user__id=request.user.id, pack=pack).exists()
        disliked = Dislikes.objects.filter(
            user__id=request.user.id, pack=pack).exists()
        # These cannot occur simultaneously
        if liked and disliked:
            Dislikes.objects.get(
                user__id=request.user.id, pack=pack).delete()
            Likes.objects.get(user__id=request.user.id, pack=pack).delete()
            liked = False
            disliked = False
        favourite = Favourites.objects.filter(
            user__id=request.user.id, pack=pack).exists()
        # Get player avg score and benchmark on total average score
        user_plays = Plays.objects.filter(
            pack=pack, user__id=request.user.id).all()
        user_best = 0
        user_scores = 0
        if user_plays.exists():
            user_best = user_plays.order_by("-score").first().score
            user_scores = round(
                sum([play.score for play in user_plays]) / len(user_plays), 2)
            scatter_trace = go.Scatter(
                y=[user_scores], mode='markers', name='your average score')
            score_plot.add_trace(scatter_trace)
        # Can the user play this game

        plot_html = opy.plot(
            score_plot, auto_open=False, output_type='div')
        categories = Category.objects.all()
        return render(request, "flashlearn/pack.html", {
            "plot": plot_html,
            "pack": pack,
            "cards": cards,
            "is_creator": is_creator,
            "can_play": can_play,
            "play_count": total_play_count,
            "liked": liked,
            "disliked": disliked,
            "favourite": favourite,
            "best_score": user_best,
            "avg_score": user_scores,
            "cards_play": json.dumps([card.serialize() for card in all_cards]),
            "categories": categories
        })
    plot_html = opy.plot(score_plot, auto_open=False, output_type='div')
    return render(request, "flashlearn/pack.html", {
        "plot": plot_html,
        "pack": pack,
        "cards": cards,
        "play_count": total_play_count,
        "is_creator": False,
        "can_play": can_play,
        "cards_play": json.dumps([card.serialize() for card in all_cards])
    })


def tutorial_view(request):
    return render(request, "flashlearn/tutorial.html")


def searchPacks(data, filtered_packs=None):
    queryString = data.get("queryString")
    if not queryString:
        return JsonResponse({"error": "invalid query String"}, status=201)
    # Extract information out of the query string
    tokens = [string for string in queryString.strip().split(" ")
              if string]
    allPacks = None
    if filtered_packs:
        allPacks = filtered_packs
    else:
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

    return packs.all()


def search_pages_view(request, page):
    if request.method == "POST":
        data = json.loads(request.body)
        packs = searchPacks(data)
        if packs == None:
            return JsonResponse({"error": "Something went wrong while finding"}, status=201)
        search_packs = packs[(page-1) * 10: page * 10]
        if len(search_packs) < 10 or page * 10 == len(packs):
            return JsonResponse({"packs": [pack.serialize() for pack in search_packs], "more": False}, status=201)
        else:
            return JsonResponse({"packs": [pack.serialize() for pack in search_packs], "more": True}, status=201)


def fs_pages_view(request, page):
    if request.method == "POST":
        data = json.loads(request.body)
        packs = Packs.objects.all()
        cat = data.get("cat")
        time = data.get("time")
        sort = data.get("sort")
        direction = data.get("direction")
        if cat:
            packs = packs.filter(category__name=cat)
        if time:
            if time == "today":
                today = datetime.today()
                year = today.year
                month = today.month
                day = today.day
                packs = packs.filter(creation_time__year=year,
                                     creation_time__month=month, creation_time__day=day)
            if time == "week":
                d = datetime.now(tz=datetime.now(
                    timezone.utc).astimezone().tzinfo) - timedelta(days=7)
                packs = packs.filter(creation_time__gte=d)
            if time == "month":
                now = datetime.now(tz=datetime.now(
                    timezone.utc).astimezone().tzinfo)
                one_month_ago = datetime(
                    now.year, now.month - 1, now.day, tzinfo=datetime.now(
                        timezone.utc).astimezone().tzinfo)
                packs = packs.filter(creation_time__gte=one_month_ago)
            if time == "year":
                now = datetime.now(tz=datetime.now(
                    timezone.utc).astimezone().tzinfo)
                one_year_ago = datetime(
                    now.year - 1, now.month, now.day, tzinfo=datetime.now(
                        timezone.utc).astimezone().tzinfo)
                packs = packs.filter(creation_time__gte=one_year_ago)

        if data.get("queryString") and len(packs) > 0:
            packs = searchPacks(data, packs)
        if sort:
            if direction:
                packs = packs.order_by(
                    sort) if direction == "up" else packs.order_by("-" + sort)
            else:
                packs = packs.order_by("-" + sort)
        filtered_packs = packs[(page-1)*10: page*10]
        if len(filtered_packs) < 10 or page * 10 == len(packs):
            return JsonResponse({"packs": [pack.serialize() for pack in filtered_packs], "more": False}, status=201)
        else:
            return JsonResponse({"packs": [pack.serialize() for pack in filtered_packs], "more": True}, status=201)


def index_pages_view(request, page):
    if request.method == "GET":
        print(page)
        all_packs = Packs.objects.order_by(
            '-creation_time').all()
        packs = all_packs[(page-1) * 10: page * 10]
        if len(packs) < 10 or page * 10 == len(all_packs):
            return JsonResponse({"packs": [pack.serialize() for pack in packs], "more": False}, status=201)
        else:
            return JsonResponse({"packs": [pack.serialize() for pack in packs], "more": True}, status=201)


def index(request):
    categories = Category.objects.all()
    return render(request, "flashlearn/index.html", {
        "categories": categories
    })

# Handle requests only for the badge on top


def friends_badge_view(request, anything):
    if request.user.is_authenticated and request.method == "GET":
        pendings = User.objects.filter(
            requested__invitee__id=request.user.id).all()
        return JsonResponse({"count": len(pendings)}, status=201)
    else:
        return JsonResponse({"count": 0}, status=201)


def friends_handler_view(request, type, page=1):
    if request.user.is_authenticated:
        if request.method == "GET":
            if type == "sent":
                all_sents = User.objects.filter(
                    requested__sender__id=request.user.id).order_by('id').all()
                sents = all_sents[(page-1)*10:10*page]
                if len(sents) < 10 or page * 10 == len(all_sents):
                    return JsonResponse({"friends": [sent.serialize() for sent in sents], "more": False}, status=201)
                else:
                    return JsonResponse({"friends": [sent.serialize() for sent in sents], "more": True}, status=201)
            elif type == "requests":
                all_pendings = User.objects.filter(
                    requests__invitee__id=request.user.id).order_by('id').all()
                pendings = all_pendings[(page-1)*10:10*page]
                if len(pendings) < 10 or page * 10 == len(all_pendings):
                    return JsonResponse({"friends": [pending.serialize() for pending in pendings], "more": False}, status=201)
                else:
                    return JsonResponse({"friends": [pending.serialize() for pending in pendings], "more": True}, status=201)
            elif type == "all":
                all_friends = User.objects.filter(
                    friended__user__id=request.user.id).order_by('id').all()
                friends = all_friends[(page-1)*10:10*page]
                if len(friends) < 10 or page * 10 == len(all_friends):
                    return JsonResponse({"friends": [friend.serialize() for friend in friends], "more": False}, status=201)
                else:
                    return JsonResponse({"friends": [friend.serialize() for friend in friends], "more": True}, status=201)

        elif request.method == "POST":
            data = json.loads(request.body)
            if type == "search":
                queryString = data.get("queryString")
                if len(queryString) == 0:
                    return JsonResponse({"friends": []}, status=201)
                byId = User.objects.filter(
                    id__icontains=queryString).exclude(
                    id=request.user.id)
                byName = User.objects.filter(username__icontains=queryString).exclude(
                    id=request.user.id)
                all_friends = byId.union(byName).order_by("id").all()
                friends = all_friends[(page-1)*10:10*page]
                friend_types = []
                for friend in friends:
                    if SentInvites.objects.filter(invitee__id=request.user.id, sender__id=friend.id).exists() and not SentInvites.objects.filter(sender__id=request.user.id, invitee__id=friend.id).exists():
                        friend_types.append((friend.userId, "AI"))
                    # If the person was already invited by u
                    elif SentInvites.objects.filter(sender__id=request.user.id, invitee__id=friend.id).exists():
                        friend_types.append((friend.userId, "S"))
                    # If the person had invited u
                    elif SentInvites.objects.filter(invitee__id=request.user.id, sender__id=friend.id).exists():
                        friend_types.append((friend.userId, "I"))
                    # If the person is already your friend
                    elif Friends.objects.filter(user__id=request.user.id, friend__id=friend.id).exists():
                        friend_types.append((friend.userId, "F"))
                    # Else its some random person
                    else:
                        friend_types.append((friend.userId, "A"))
                if len(friends) < 10 or page * 10 == len(all_friends):
                    return JsonResponse({"friends": [friend.serialize() for friend in friends], "more": False, "friend_types": friend_types}, status=201)
                else:
                    return JsonResponse({"friends": [friend.serialize() for friend in friends], "more": True, "friend_types": friend_types}, status=201)
            # Button operations
            if type == "remove":
                try:
                    toRemove = data.get("toRemove")
                    SentInvites.objects.get(sender_id=request.user.id,
                                            invitee__userId=toRemove).delete()
                    return JsonResponse({"successful": True}, status=201)
                except:
                    return JsonResponse({"failure": False}, status=201)

            if type == "removeFriend":

                friendCode = data.get("toRemoveFriend")
                print(friendCode)
                forward = Friends.objects.filter(user__id=request.user.id,
                                                 friend__userId=friendCode)
                backwards = Friends.objects.filter(user__userId=friendCode,
                                                   friend__id=request.user.id)
                if forward.exists() and backwards.exists():
                    forward.first().delete()
                    backwards.first().delete()
                else:
                    print("no friend???")
                    return JsonResponse({"failure": False}, status=201)

                return JsonResponse({"successful": True}, status=201)

            if type == "accept":
                try:
                    # Add to friend
                    toAccept = data.get("toAccept")
                    user = User.objects.get(id=request.user.id)
                    friend = User.objects.get(userId=toAccept)
                    rel1 = Friends(user=user, friend=friend)
                    rel2 = Friends(user=friend, friend=user)
                    rel1.save()
                    rel2.save()
                    # Remove from any sents to me
                    SentInvites.objects.get(
                        sender=friend, invitee=user).delete()
                    # Possible that I also sent to them
                    if len(SentInvites.objects.filter(sender=user, invitee=friend)) > 0:
                        SentInvites.objects.get(
                            sender=user, invitee=friend).delete()
                    return JsonResponse({"successful": True}, status=201)
                except:
                    return JsonResponse({"failure": False}, status=201)
            if type == "reject":
                try:
                    toReject = data.get("toReject")
                    SentInvites.objects.get(
                        sender__userId=toReject, invitee__id=request.user.id).delete()
                    return JsonResponse({"successful": True}, status=201)
                except:
                    return JsonResponse({"failure": False}, status=201)
            if type == "invite":
                try:
                    inviteCode = data.get("toInvite")
                    sender = User.objects.get(id=request.user.id)
                    invitee = User.objects.get(userId=inviteCode)
                    newInvite = SentInvites(sender=sender, invitee=invitee)
                    newInvite.save()
                    return JsonResponse({"successful": True}, status=201)
                except:
                    return JsonResponse({"failure": False}, status=201)


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

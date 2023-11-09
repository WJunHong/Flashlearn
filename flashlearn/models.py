from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
import json


def user_image_location(instance, filename):
    return 'user_images/user_{0}_{1}'.format(instance.userId, filename)


class User(AbstractUser):
    email = models.EmailField(unique=True)
    userId = models.CharField(unique=True, max_length=6)

    # Image url
    image = models.ImageField(blank=True, upload_to=user_image_location)

    def serialize(self):
        return {
            "userId": self.userId,
            "name": self.username,
            "image": self.image.url if self.image else None
        }


class Category(models.Model):
    # name
    name = models.CharField(max_length=100, default="Others")


class Packs(models.Model):
    # Name
    name = models.CharField(max_length=100, default="TBD")
    # ID
    packId = models.CharField(
        unique=True, max_length=7, primary_key=True, default="pAAAAAA")
    # Number of cards
    cards = models.PositiveIntegerField(
        validators=[MinValueValidator(1)], default=1)
    # privacy
    privacy = models.CharField(max_length=1, choices=[
                               ("P", "Private"), ("F", "Friends"), ("A", "All")], default="A")
    # Description
    description = models.TextField(blank=True, default="")
    # Category
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="packs", blank=True, default="", null=True)
    # Creator
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="created_packs", default=1)
    # Global average score
    avg_score = models.FloatField(
        default=0, validators=[MinValueValidator(0)])
    avg_difficulty = models.FloatField(
        default=0, validators=[MinValueValidator(0)])
    like_count = models.IntegerField(
        default=0)
    # Creation time
    creation_time = models.DateTimeField(auto_now=True)

    def serialize(self, id=0):
        return {
            "id": self.packId,
            "creator": self.creator.username,
            "creation_time": self.creation_time.strftime("%b %d %Y, %I:%M %p"),
            "name": self.name.title(),
            "cards": self.cards,
            "privacy": self.privacy,
            "category": self.category.name if self.category else None,
            "avg_score": self.avg_score,
            "description": self.description,
            "like_count": self.like_count,
            "avg_difficulty": self.avg_difficulty
        }


class Plays(models.Model):
    # def validate_score(self, value):
    #     if value < 0 or value > self.pack.cards:
    #         raise ValidationError(
    #             ("%(value)s is not an even number"),
    #             params={"value": value},)
    # User
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="played", null=True)
    # pack
    pack = models.ForeignKey(
        Packs, on_delete=models.CASCADE, related_name="plays", default=1)
    # score
    score = models.IntegerField(
        validators=[MinValueValidator(0)], default=0)
    # Date
    play_time = models.DateTimeField(auto_now=True)

    def serialize(self, id):
        return {
            "score": self.score,
            "play_time": self.play_time.strftime("%b %d %Y, %I:%M %p")
        }


def image_location(instance, filename):
    return 'card_images/card_{0}_{1}'.format(instance.pack.packId, filename)


class Cards(models.Model):
    # Pack
    pack = models.ForeignKey(
        Packs, on_delete=models.CASCADE, related_name="related_cards", default=1)
    # Question
    question = models.CharField(max_length=200, default="TBD")
    # Difficulty
    difficulty = models.CharField(max_length=1, choices=[
                                  ("H", "Hard"), ("M", "Med"), ("E", "Easy")], default="E")
    # Answer
    answer = models.CharField(max_length=200, default="TBD")
    # Hint
    hint = models.CharField(blank=True, max_length=200)
    # Image url
    image = models.ImageField(blank=True, upload_to=image_location)

    def serialize(self):
        return {
            "question": self.question,
            "difficulty": self.difficulty,
            "answer": self.answer,
            "hint": self.hint,
            "image": self.image.url if self.image else None
        }


class Friends(models.Model):
    # User
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friends", default=1)
    # Friends
    friend = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friended", default=1)


class SentInvites(models.Model):
    # user
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="requests", default=1)
    # Users requested
    invitee = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="requested", default=1)
    pass


class Likes(models.Model):
    # Pack ID
    pack = models.ForeignKey(
        Packs, on_delete=models.CASCADE, related_name="likes", default=1)
    # User
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="liked", default=1)


class Dislikes(models.Model):
    # Pack ID
    pack = models.ForeignKey(
        Packs, on_delete=models.CASCADE, related_name="dislikes", default=1)
    # User
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="disliked", default=1)


class Favourites(models.Model):
    # Pack ID
    pack = models.ForeignKey(
        Packs, on_delete=models.CASCADE, related_name="favourites", default=1)
    # User
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="favourited", default=1)

from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    email = models.EmailField(unique=True)


class Packs(models.Model):
    pass


class Cards(models.Model):
    pass


class Friends(models.Model):
    pass


class Favourites(models.Model):
    pass

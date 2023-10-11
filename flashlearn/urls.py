from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("register", views.register_view, name="register"),
    path("tutorial", views.tutorial_view, name="tutorial"),
    path("logout", views.logout_view, name="logout"),
    path("friends", views.friends_view, name="friends"),
    path("create", views.create_view, name="create"),
    path("profile", views.profile_view, name="profile"),
]

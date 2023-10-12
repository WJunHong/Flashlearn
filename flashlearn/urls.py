from django.urls import path, re_path

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
    re_path(r'^(?P<profile>profile/)?(?P<pack_id>pack/(\d|\w){6})',
            views.pack_view, name='pack')
]

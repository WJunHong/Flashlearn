from django.urls import path, re_path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("index/<int:page>", views.index_pages_view, name="load_page"),
    path("search/<int:page>", views.search_pages_view, name="load_search_page"),
    path("fs/<int:page>", views.fs_pages_view, name="load_fs_page"),
    path("login", views.login_view, name="login"),
    path("register", views.register_view, name="register"),

    path("logout", views.logout_view, name="logout"),
    path("friends", views.friends_view, name="friends"),
    path("friends/<str:type>", views.friends_handler_view, name="friend_handler_2"),
    path("friends/<str:type>/<int:page>",
         views.friends_handler_view, name="friend_handler"),
    path("create", views.create_view, name="create"),
    path("profile/<str:profile>", views.profile_view,
         name="profile"),  # navigate to profile
    path("profile/<str:profile>/<str:type>",  # Profile buttons
         views.profile_pack_view, name="profile_action"),
    path("profile/pack/pack/<str:pack_id>",  # Profile pack link
         views.reroute_pack_view, name="profile_pack"),
    re_path(r'^(?P<anything>.*?)badge',
            views.friends_badge_view, name="friend_badge"),
    path("pack/<str:pack_id>",  # regular pack link
         views.pack_view, name='pack'),
    path("pack/<str:packId>/<str:operation>",  # regular pack link handler
         views.pack_handler_view, name="pack_ops"),
    path("profile/pack/pack/<str:packId>/<str:operation>",  # regular pack link handler
         views.pack_handler_view, name="pack_ops"),
]

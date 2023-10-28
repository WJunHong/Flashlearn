from django.urls import path, re_path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("index/<int:page>", views.index_pages_view, name="load_page"),
    path("search/<int:page>", views.search_pages_view, name="load_search_page"),
    path("fs/<int:page>", views.fs_pages_view, name="load_fs_page"),
    path("login", views.login_view, name="login"),
    path("register", views.register_view, name="register"),
    path("tutorial", views.tutorial_view, name="tutorial"),
    path("logout", views.logout_view, name="logout"),
    path("friends", views.friends_view, name="friends"),
    path("friends/<str:type>", views.friends_badge_view, name="friend_badge"),
    path("create", views.create_view, name="create"),
    path("profile", views.profile_view, name="profile"),
    re_path(r'^(?P<profile>profile/)?(?P<pack_id>pack/p(\d|\w){6})',
            views.pack_view, name='pack')
]

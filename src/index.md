---
layout: default
slug: home
---

<h3>Posts</h3>
<ul>
    {% for post in site.posts %}
        <li>
            <a href="{{ post.url }}">
                {{ post.title }}
            </a>
        </li>
    {% endfor %}
</ul>

<h3>Categories</h3>
<ul>
    {% for category in site.categories %}
        <li><a href="category/{{ category[0] | downcase}}">{{ category[0] }}</a></li>
    {% endfor %}
</ul>

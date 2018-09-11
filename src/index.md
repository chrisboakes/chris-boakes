---
layout: default
slug: home
---

{% assign intro = site.bios | where: "title", "Blog Bio" %}
<p class="INTRO">title: {{ intro.title }}</p>

<ul>
    {% for post in site.posts %}
        <li>
            <a href="{{ post.url }}">
                {{ post.title }}
            </a>
        </li>
    {% endfor %}
</ul>

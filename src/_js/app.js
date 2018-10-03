import './svg-sprite';
import NavMenu from './nav-menu';
import SlideLinks from './page-slides';
import InstaFeed from './instagram-feed';
import Prism from 'prismjs';

Prism.highlightAll();

new NavMenu();
new SlideLinks();

if (document.querySelector('#instagram-feed')) {
    new InstaFeed({
        accessToken: '279935511.1677ed0.8cb9281958044af9a568ee8a1a2a9e9b'
    });
}

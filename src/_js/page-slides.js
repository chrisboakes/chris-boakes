/**
 * Handle any links that slide the user to a point on the page
 * @author Chris Boakes
 */
import jump from 'jump.js';

export default class {
    constructor() {
        let pageSlideLinks = document.querySelectorAll('.js-slide-link');

        if (pageSlideLinks.length) {
            pageSlideLinks.forEach((slideLink) => {
                this.initSlideAction(slideLink);
            });
        }
    }

    /**
     * Initialise page slide on click
     */
    initSlideAction(slideLink) {
        slideLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (slideLink.getAttribute('href')) {
                jump(slideLink.getAttribute('href'), {
                    duration: 500
                });
            }
        });
    }
}

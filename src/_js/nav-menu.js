export default class {
    constructor() {
        this.body = document.querySelector('body');
        this.menuDescription = document.querySelector('.js-menu-description');
        this.menuText = document.querySelector('.js-menu-toggle-text');
        this.menuIsExpanded = false;

        document.querySelectorAll('.js-menu-trigger').forEach((button) => {
            button.addEventListener('click', (e) => this.handleClick(e));
        });
    }

    handleClick(e) {
        // Match variable with CSS fade transition length. Stops background flicker.
        let transitionDuration = this.menuIsExpanded ? 0 : 300;
        this.body.classList.toggle('body--menu-is-expanded');
        this.body.classList.toggle('no-scroll');
        setTimeout(() => {
            document.documentElement.style.height = this.menuIsExpanded ? 'inherit' : '100%';
            this.menuIsExpanded = !this.menuIsExpanded;
        }, transitionDuration);
        this.menuText.innerText = this.menuIsExpanded ? 'Open' : 'Close';
    }
}

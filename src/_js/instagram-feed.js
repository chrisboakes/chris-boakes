/**
 * A very basic example of retrieving a feed of Instagram posts and appending it to a container
 * @param {String} accessToken - Access token from Instagram <https://www.instagram.com/developer/authentication/>
 * @param {String} containerSelector - The id or classs of the DOM Element we're append our feed into
 * @param {String} rootClass - The class we'll use for each Instagram DOM Element
 * @param {String} totalImages - How many images we're fetching from the API
 * @version 0.1
 * @author Chris Boakes
 */
export default class InstagramFeed {
    constructor(options) {
        // Combine our default parameters with those passed in
        this.options = this.combineDefaultOptions(options);
        // Initialise the feed
        this.initInstagramFeed();
    }

    /**
     * Default parameters with passed in parameter
     * @return Object
     */
    combineDefaultOptions(options) {
        return {
            ...{
                accessToken: '',
                containerSelector: '#instagram-feed',
                rootClass: 'c-instagram-image',
                totalImages: 6
            },
            ...options
        };
    }

    /**
     * Initialise the feed
    */
    async initInstagramFeed() {
        if (this.hasContainer() && this.hasAccessToken()) {
            this.container = this.setContainer();
            this.feedData = await this.getInstagramData();
            if (this.feedData) {
                this.appendFeed();
            }
        }
    }

    /**
     * Assign container based on the containerSelector
     * @return baseElement
     */
    setContainer() {
        return document.querySelector(this.options.containerSelector);
    }

    /**
     * Does the container exist in the DOM?
     * @return Boolean
     */
    hasContainer() {
        if (!document.querySelector(this.options.containerSelector)) {
            console.error('No Instagram feed container found');
            return false;
        }

        return true;
    }

    /**
     * Has an access token been set?
     * @return Boolean
     */
    hasAccessToken() {
        if (!this.options.accessToken) {
            console.error('Instagram feed access token not set');
            return false;
        }

        return true;
    }

    /**
     * Fetch our data from the instagram API
     * @return Object
     */
    async getInstagramData(token) {
        let data = null;

        await fetch(`https://api.instagram.com/v1/users/self/media/recent/?access_token=${this.options.accessToken}&count=${this.options.totalImages}`)
            .then((response) => response.json())
            .then((response) => {
                if (response.data.length) {
                    data = response;
                } else {
                    console.error('Error getting content from Instagram API');
                }
            })
            .catch((err) => {
                console.error('Fetch error', err);
            });
        return data;
    }

    /**
     * Loop through each item of feed data and append it to the container
     */
    appendFeed() {
        if (this.feedData.data.length) {
            this.feedData.data.forEach((item) => {
                this.container.insertAdjacentHTML('beforeend', this.itemMarkup(item));
            });
        }
    }

    /**
     * Construct the markup for each Instagram image
     * @param {Object} item
     */
    itemMarkup(item) {
        const isPortrait = (item.images.standard_resolution.height > item.images.standard_resolution.width);
        return `
            <li class="${this.options.rootClass} ${this.options.rootClass}--${isPortrait ? 'portrait' : 'landscape'}">
                <a href="${item.link}" class="${this.options.rootClass}__link" rel="nofollow noopener" target="_blank">
                    <img src="${item.images.standard_resolution.url}"
                        alt="${item.caption.text}"
                        height="${item.images.standard_resolution.height}"
                        width="${item.images.standard_resolution.width}"
                        class="${this.options.rootClass}__image"
                    />
                </a>
            </li>
        `;
    }
}

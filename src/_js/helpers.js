export default {
    /**
     * Limit a string to a certain word count
     * @param {String} str
     * @param {Integer} wordCount
     */
    truncate(str, wordCount) {
        let totalWords = str.split(' ');
        let concatenated = str.split(' ').splice(0, wordCount).join(' ');
        return concatenated + (totalWords.length > wordCount ? ' [...]' : '');
    }
};

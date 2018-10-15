// Twitter library
var Twit = require('twit');

// We need to include our configuration file
var T = new Twit(require('./config.js'));

// MediaWiki library
const Mw = require('nodemw'),
    client = new Mw({
        server: 'en.wikipedia.org',
        path: '/w'
    });

function getRandomUnsourcedPage(callback) {
    // Note that 'All_articles_with_unsourced_statements' category never gets a callback in a reasonable amount of time, so we have to do it using this category.
    client.getPagesInCategory('Articles_with_unsourced_statements', function (get_subcats_error, subcats) {
        if (get_subcats_error) {
            console.log(get_subcats_error);
        } else {
            subcats = subcats.filter(el => el.title.startsWith('Category:Articles'));
            var selected_subcat = subcats[Math.floor(Math.random() * subcats.length)];
    
            // Get pages from this subcat
            client.getPagesInCategory(selected_subcat.title.replace('Category:', ''), function (get_pages_error, pages) {
                if (get_pages_error) {
                    console.log(get_pages_error); 
                } else {
                    selected_page = pages[Math.floor(Math.random() * pages.length)];
                    callback(selected_page);
                }
            });
        }
    });
}

function sanitize(content) {
    // Replace strings in content to avoid common areas we don't want to quote from.

    // There can be citation neededs here, but honestly i cba.
    content = content.replace(/=+\s*References\s*=+[\s\S]*/gim, '');

    // Don't want anything inside these tags.
    content = content.replace(/^{{infobox[\s\S]+?^}}/gim, '');                  // infobox
    content = content.replace(/^{\|[\s\S]+?^\|}/gim, '');                       // wikitable
    content = content.replace(/\[{2}(file|image):.*\]{2}/gi, '');               // [[File:blah|deblah]]
    content = content.replace(/\{{2}redirect\|.*\}{2}/gi, '');                   // {{Redirect|x}}
    content = content.replace(/={2}.*={2}/g, '');                               // ==Section Headings==
    content = content.replace(/<!--.+?-->/g, '');                               // <!--this weird note tag-->
    content = content.replace(/(<ref.*?>)((.*?)(<\/ref>))?/gi, '');             // <ref>reference</ref> and also <ref name= />
    content = content.replace(/\{{2}cite[\s\S]+?\}{2}\s?<\/ref>/gim, '');       // {{cite book.... }}</ref> this weird pattern

    // For these, some of the groups are preserved.
    content = content.replace(/\[\[([^\]\|]+?)\|(.+?)\]\]/g, '$2');             // [[bad format|good format]]
    content = content.replace(/{{convert\|(.+?)\|(.+?)\|.+?}}/gi, '$1$2');      // convert units (have to use original units)

    // Remove some patterns that would look funny if they appeared in the final tweet.
    content = content.replace(/'{2,}/g, '');                                    // multiple single quotes
    content = content.replace(/[\[\]]/g, '');                                   // [] braces
    content = content.replace(/<\/?su(b|p)>/g, '');                             // subscript, superscript

    return content;
}
module.exports.sanitize = sanitize;

function formatURL(page_id) {
    var prefix = 'https://en.wikipedia.org/?curid=';
    return prefix + page_id;
}

function checkTweetLength(string) {
    var len = string ? string.length : 0;
    // 24 characters reserved for link and a single space.
    return (len <= 280 - 24);
}

function formatSentence(sentence) {
    return sentence;
}

function parseUnsourcedSentences(content) {
    var sentences = [];
    var pattern_cn = /{{[Cc]([Nn]|itation [Nn]eeded)(\|[=\w\s\d]+)?}}/;

    // Sentence ending in a period followed by. {{cn}}
    var pattern_period_before_cn = /([A-Z][^\}\.\n]+?\.)\s*/;
    var re_one = new RegExp(pattern_period_before_cn.source +          // full sentence including period
            pattern_cn.source,                                         // citation needed group
            'g');
    var match = [];
    while ((match = re_one.exec(content)) !== null) {
        if (checkTweetLength(match[1])) sentences.push(match[1]); // Only want 1st group of expression
    }
    // Sentence ending in {{cn}}. The period is at the end in this case.
    // OR
    // Sentence with {{cn}} somewhere within it, but also ending in a period.
    var pattern_period_after_cn_prefix = /([A-Z][^}\.\n]+?)/;
    var pattern_period_after_cn_suffix = /([^\.\n]*?\.)/;
    var re_two = new RegExp(pattern_period_after_cn_prefix.source +    // first part of sentence before cn
            pattern_cn.source +                                        // citation needed group
            pattern_period_after_cn_suffix.source,                     // second part of sentence including period.
            'g');
    while ((match = re_two.exec(content)) !== null) {
        if (checkTweetLength(match[1] + match[4])) sentences.push(match[1] + match[4]); // 1st and 4th group of expression
    }

    // Some citations are a span, wouldn't it be nice if they all were?
    var pattern_cn_span = /{{([Cc]([Nn]|itation) span\s*\|\s*)([^\.\n]*?\.)(\s*\|[=\w\s\d]+)?}}/;
    var re_three = new RegExp(pattern_cn_span.source, 'g');
    while ((match = re_three.exec(content)) !== null) {
        if (checkTweetLength(match[3])) sentences.push(match[3]); // Only the 3rd group is wanted.
    }

    return sentences;
}
module.exports.parseUnsourcedSentences = parseUnsourcedSentences;

function tweetASentence() {
    // (1) Get an appropriate page.
    getRandomUnsourcedPage(function (page) {
        // (2) Get page contents
        client.getArticle(page.title, function (get_article_error, content){
            if (get_article_error) {
                console.log(get_article_error);
            } else {
                // (3) Strip the page of unwanted content.
                content = sanitize(content);
                var sentences = parseUnsourcedSentences(content);
                var length = sentences ? sentences.length : 0;
                // If we failed to get any sentences from the selected article, try again.
                if ( length == 0 ) {
                    // Wait a few minutes before trying again.
                    console.log('No sentence found, waiting a minute.');
                    setTimeout(tweetASentence, 1000 * 60 * 1);
                } else {
                    // (5) Format a match
                    var tweet_text = formatSentence(sentences[Math.floor(Math.random() * sentences.length)]);
                    tweet_text = tweet_text + ' ' + formatURL(page.pageid);
                    var time_now = new Date();
                    console.log(time_now.toTimeString() + ' ' + tweet_text);
                    // (6) Tweet the sentence.
                    T.post('statuses/update', { status: tweet_text }, function (tweet_error, data) {
                        if (tweet_error) console.log(tweet_error);
                    });
                }
            }
        } );
    });

}

// Guard against running the bot when doing an 'npm test'.
if (!module.parent) {
    // Try to tweet something as soon as we run the program...
    tweetASentence();
    // ...and then every hour after that. Time here is in milliseconds, so
    //1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
    setInterval(tweetASentence, 1000 * 60 * 60);
}


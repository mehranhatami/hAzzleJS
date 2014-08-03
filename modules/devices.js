// devices
// Temporary - I will come up with a better solution later on - K.F

var agent = navigator.userAgent.toLowerCase();


 hAzzle.getMobile = function() {

      if (!('ontouchend' in document)) {

            return null;

        } else {

            if (agent.search('iphone') !== -1 || agent.search('ipad') !== -1) {

                return 'ios';

            } else if (agent.search('android') !== -1 || agent.search('applewebkit') !== -1) {

                return 'android';

            } else if (agent.search('msie') !== -1) {

                return 'winMobile';

            }

            return null;

        }

    }
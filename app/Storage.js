'use strict';

const Utils = require('./Utils');
const redis = require('redis');

class Storage {
    
    constructor(app)
    {
        this.app = app;
        
        // let redisOptions = null;
        let redisOptions = process.env.REDIS_URL;
        

        // Initialize redis client
        if (redisOptions) {
            this.client = redis.createClient(redisOptions);
            this.listener = redis.createClient(redisOptions);
        } else {
            this.client = redis.createClient();
            this.listener = redis.createClient();
        }
    }
    
    startListening() {

        var self = this;

        this.listener.on("subscribe", function (channel, count) {
            console.log("Listener subscribed to channel:  " + channel);
        });
         
        this.listener.on("message", function (channel, message) {
            // console.log("Listener tirggered: ", message);
            self.app.getPusher().notifyConnections(message);
        });
         
        // Subscribe redis client to listen to the same chanel, which is used by App1 to send message whenever Player's leaderboard change
        this.listener.subscribe(Utils.getConfig('channel_leaderboard'));
    }

    stopListening() {
        if (this.listener) {
            this.listener.unsubscribe();
            this.listener.quit();
        }

        this.listener = null;
    }



    /**
     * 
     * @param int page
     * @param int limit
     * @param int extendRange
     * @return array
     */
    search(page, limit, extendRange, callback) {
        if (typeof page == 'undefined') {
            var page = 1;
        }

        if (typeof limit == 'undefined') {
            var limit = -1;
        }

        if (typeof extendRange == 'undefined') {
            var extendRange = 0;
        }

        var startIndex, endIndex
        if (limit < 0) {
            startIndex = 0;
            endIndex = -1;
        } else {
            startIndex = (page - 1) * limit;
            endIndex = startIndex + limit - 1 + extendRange;
        }

        this.client.zrevrange(
            Utils.getConfig('storage_key_leaderboard'),
            startIndex,
            endIndex,
            'withscores',
            function(err, result) {
                if (err) {
                    console.log('Redis client unable to search:', err);
                } else {
                    var data = {}, itemKey, isScore = false;
                    for (var i = 0, len = result.length; i < len; i++) {
                        if (isScore) {
                            data[result[i-1]] = result[i];
                        }

                        isScore = !isScore;
                    }
                    callback(data);
                }
            }
        );
    }
}

module.exports = Storage;
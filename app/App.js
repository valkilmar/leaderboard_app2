'use strict';

const Utils = require('./Utils');
const Storage = require('./Storage');
const Pusher = require('./Pusher');

class App {
    
    constructor()
    {
        this.storage = new Storage(this); // This will handle also the listening for DB changes
        this.pusher = new Pusher(this);
        this.action = null;

        this.start = function() {
            this.storage.startListening();
            this.pusher.start();
        };

        this.stop = function() {
            this.storage.stopListening();
            this.pusher.stop();
        };

        this.getStorage = function() {
            return this.storage;
        };

        this.getPusher = function() {
            return this.pusher;
        };
    }

    handleRequest() {
        this.action = 'start';
        if (process.argv.length >= 3) {
            this.action = process.argv[2].toLowerCase();
        }
        
        switch (this.action) {
            
            case 'start':
                this.start();
                break;
            case 'stop':
                this.stop();
                break;
            default:
                throw 'Server action unsupported: ' + this.action;
        }
    }
}

module.exports = App;
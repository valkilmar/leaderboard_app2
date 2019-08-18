'use strict';

const Utils = require('./Utils');
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

class Pusher {
    
    constructor(app)
    {
        this.app = app;
        this.io = null;
        this.connections = {};
    }
    
    start() {

        if (this.io) {
            return; // That means Pusher is already started.
        }

        const PORT = Utils.getConfig('socket_port');

        var appReference = this.app;

        this.server = express()
        .listen(PORT, () => console.log('Pusher listening on port: ' + PORT));

        // Initialize the io
        this.io = socketIO(this.server);

        console.log('env port: ', process.env.PORT);

        this.connections = {};

        this.io.on('connection', (socket) => {
            
            var socketId = socket.id;
            console.log('Client connected: #', socketId);
            // connections[socket.id] = socket;

            socket.on('disconnect', () => {
                appReference.getPusher().removeConnectionPreferences(socketId);
                console.log('Client disconnected: #', socketId);
            });

            socket.on('client_leaderboard', (message) => {
                // console.log('Client requested leaderboard: #', socketId, message);
                var self = appReference.getPusher();
                try {
                    var params = JSON.parse(message);
                    self.setConnectionPreferences(socketId, params);
                    self.sendLeaderboard(socketId);
                } catch (error) {
                    console.log('Client requested leaderboard error: #', socketId, message, error);
                }
                
            });

            socket.on('client_preferences', (message) => {
                // console.log('Client sent preferences: #', socketId, message);
                try {
                    var params = JSON.parse(message);
                    appReference.getPusher().setConnectionPreferences(socketId, params);
                } catch (error) {
                    console.log('Client sent preferences error: #', socketId, message, error);
                }
                
            });
        });
    }

    stop() {
        if (this.io) {
            this.io = null;
        }
    }

    sendLeaderboard(connectionId) {
        if (!this.io || !this.isConnected(connectionId)) {
            return null;
        }

        var self = this;
        var connectionPreferences = this.getConnectionPreferences(connectionId);

        if (!connectionPreferences) {
            connectionPreferences = {}
        }

        if (!connectionPreferences.hasOwnProperty('page')) {
            connectionPreferences.page = 1;
        }

        if (!connectionPreferences.hasOwnProperty('limit')) {
            connectionPreferences.limit = parseInt(Utils.getConfig('leaderboard_default_limit'));
        }

        this.app.getStorage().search(connectionPreferences.page, connectionPreferences.limit, 0, function(data) {
            var message = {
                'leaderboard' : data
            };
            message = JSON.stringify(message);
            self.io.to(connectionId).emit('leaderboard', message);
            console.log('Leaderboard sent to: #', connectionId, connectionPreferences, message);
        });
    }

    notifyConnections(params) {
        for(var k in this.connections) {
            this.sendLeaderboard(k);
        }
    }

    isConnected(connectionId) {
        return (typeof this.connections[connectionId] !== 'undefined');
    }

    setConnectionPreferences(connectionId, connectionData) {
        this.connections[connectionId] = connectionData;
    }

    getConnectionPreferences(connectionId) {
        return (typeof this.connections[connectionId] !== 'undefined') ? this.connections[connectionId] : null;
    }

    removeConnectionPreferences(connectionId) {
        delete this.connections[connectionId];
    }
}

module.exports = Pusher;
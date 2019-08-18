'use strict';

class Utils {
    
    /**
     * 
     * @param string key
     * @param mixed defaultValue
     * @return mixed
     */
    static getConfig(key, defaultValue)
    {
        if (typeof defaultValue === 'undefined') {
            var defaultValue = null;
        }
        
        if (this.configuration === null) {
            const fs = require('fs');
            const ini = require('ini');
            this.configuration = ini.parse(fs.readFileSync('app/config/app.ini', 'utf-8'));
        }
        
        if (typeof this.configuration[key] != 'undeifned') {
            return this.configuration[key];
        }

        return defaultValue;
    }
}

Utils.configuration = null;
module.exports = Utils;
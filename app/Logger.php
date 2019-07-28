<?php

namespace AppVal;


class Logger {
    
    const LEVEL_INFO = 'INFO';
    const LEVEL_WARNING = 'WARNING';
    const LEVEL_ERROR = 'ERROR';
    
    /**
     *
     * @var string
     */
    private static $pathLogFile;
    
    private static function getPath()
    {
        if (null === self::$pathLogFile) {
            self::$pathLogFile = Utils::getConfig('log_path');
        }
        return self::$pathLogFile;
    }
    
    public static function log($message, $level = self::LEVEL_INFO)
    {
        
        $path = self::getPath();
        @touch($path);
        
        // Added as heroku doen't provide write permissions to app's folders
        if (!is_writable($path)) {
            return false;
        }
        
        if (is_array($message) || is_object($message)) {
            $message = json_encode($message);
        } elseif (!is_string($message)) {
            $message = (string)$message;
        }
        
        $data = '';
        $data .= '[' . date('Y-m-d H:i:s') . '] ';
        $data .= '[' . $level . '] ';
        $data .= '[' . $message . ']' . PHP_EOL;
        
        file_put_contents($path, $data, FILE_APPEND);
    }
}
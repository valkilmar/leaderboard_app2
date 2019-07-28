<?php

namespace AppVal;

class Utils {
    private static $configuration;
    
    /**
     * 
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function getConfig($key, $default = null)
    {
        if (null === self::$configuration) {
            self::$configuration = require_once __DIR__ . '/config/app.php';
        }
        
        return self::getValue(self::$configuration, $key, $default);
    }
    
    
    /**
     * Retrieves the value of an array element or object property with the given key or property name.
     * If the key does not exist in the array or object, the default value will be returned instead.
     *
     * @param array|object $array array or object to extract value from
     * @param string|array $key key name of the array element, an array of keys or property name of the object,
     * @param mixed $default the default value to be returned if the specified array key does not exist. Not used when getting value from an object.
     * @return mixed the value of the element if found, default value otherwise
     * @throws InvalidParamException if $array is neither an array nor an object.
     */
    public static function getValue($array, $key, $default = null)
    {
        if (is_array($key)) {
            $lastKey = array_pop($key);
            foreach ($key as $keyPart) {
                $array = static::getValue($array, $keyPart);
            }
            $key = $lastKey;
        }

        if (is_array($array) && array_key_exists($key, $array)) {
            return $array[$key];
        }

        if (($pos = strrpos($key, '.')) !== false) {
            $array = static::getValue($array, substr($key, 0, $pos), $default);
            $key = substr($key, $pos + 1);
        }

        if (is_object($array)) {
            return $array->$key;
        } elseif (is_array($array)) {
            return array_key_exists($key, $array) ? $array[$key] : $default;
        } else {
            return $default;
        }
    }
}
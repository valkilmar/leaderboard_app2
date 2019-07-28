<?php

return [
    /*
    'redis' => [
        'scheme'   => 'tcp',
        'host'     => '127.0.0.1',
        'port'     => 6379,
        'password' => null,
        'database' => 0
    ],
    */
    'redis' => getenv('OPENREDIS_URL'),
    'channel_pubsub' => 'channel_pubsub',
    'log_path' => realpath(__DIR__ . '/../log') . DIRECTORY_SEPARATOR . 'app.log'
];
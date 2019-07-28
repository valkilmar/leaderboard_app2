<?php

namespace AppVal;

use Predis\Client;

class App {
    const ACTION_START = 'start';
    const ACTION_STOP = 'stop';
    
    private $redisClient;
    private $listenerChannel;
    
    private $listener;
    private $pusher;
    
    public function __construct()
    {
        $this->redisClient = new Client(Utils::getConfig('redis'));
        
        $this->listenerChannel = Utils::getConfig('channel_pubsub');
    }
    
    
    public function handeRequest($params)
    {
        if (isset($params[1])) {
            $action = strtolower($params[1]);
            
            switch ($action) {
                case self::ACTION_START:
                    $this->startListening();
                    $this->startPushing();
                    break;

                case self::ACTION_STOP:
                    $this->stopListening();
                    $this->stopPushing();
                    break;

                default:
                    throw new \InvalidArgumentException('Messenger command invalid: ' . $action);
            }
        } else {
            throw new \InvalidArgumentException('Messenger command (' . self::ACTION_START . '|' . self::ACTION_STOP . ') required.');
        }
    }
    
    
    public function startListening()
    {
        $this->listener = $this->redisClient->pubSubLoop();
        $this->listener->subscribe($this->listenerChannel);
        
        foreach ($this->listener as $message) {
            
            switch ($message->kind) {
                case 'subscribe':
                    $customMessage = "Subscribed to {$this->listenerChannel}";
                    Logger::log($customMessage);
                    echo $customMessage . PHP_EOL;
                    break;

                case 'message':
                    $customMessage = "message: {$message->payload}";
                    Logger::log($customMessage);
                    echo $customMessage . PHP_EOL;
                    break;
            }
        }
    }
    
    public function stopListening()
    {
        if ($this->listener) {
            $this->listener->unsubscribe($this->listenerChannel);
            $this->listener = null;
            
            $customMessage = 'Unsubscribed from ' . $this->listenerChannel;
            
            Logger::log($customMessage);
            echo $customMessage . PHP_EOL;
        }
    }
    
    public function startPushing()
    {
        
    }
    
    public function stopPushing()
    {
        
    }
}
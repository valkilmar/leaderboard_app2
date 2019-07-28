<?php

require __DIR__.'/../vendor/autoload.php';

use AppVal\App;

$app = new App();

try {
    $app->handeRequest($argv);
} catch (\InvalidArgumentException $ex) {
    echo $ex->getMessage();
}


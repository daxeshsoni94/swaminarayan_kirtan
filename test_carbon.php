<?php
require 'vendor/autoload.php';
use Carbon\Carbon;

// Mock today as August 30th
Carbon::setTestNow(Carbon::create(2026, 8, 30));

$months1 = collect(range(0, 11))->map(
    fn($i) => Carbon::now()->subMonths(11 - $i)->startOfMonth()
);
print_r($months1->map(fn($m) => $m->format('M'))->values()->all());

$months2 = collect(range(0, 11))->map(
    fn($i) => Carbon::now()->subMonthsNoOverflow(11 - $i)->startOfMonth()
);
print_r($months2->map(fn($m) => $m->format('M'))->values()->all());

// Wait, a better way is to do `now()->startOfMonth()->subMonths()`
$months3 = collect(range(0, 11))->map(
    fn($i) => Carbon::now()->startOfMonth()->subMonths(11 - $i)
);
print_r($months3->map(fn($m) => $m->format('M'))->values()->all());

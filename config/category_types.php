<?php
// config/category_types.php

return [
    'creator' => [
        'key'             => 'Creator',          // canonical English value stored in DB
        'translation_key' => 'creator',
        'gu'              => 'રચયિતા',
        'is_custom'       => false,
        'icon'            => 'bx bx-user',
        'search_terms'    => 'rachiyta rachiya creator રચયિતા'
    ],
    'event' => [
        'key'             => 'Event',
        'translation_key' => 'event',
        'gu'              => 'પ્રસંગ',
        'is_custom'       => false,
        'icon'            => 'bx bx-calendar-event',
        'search_terms'    => 'prasang event પ્રસંગ'
    ],
    'place' => [
        'key'             => 'Place',
        'translation_key' => 'place',
        'gu'              => 'સ્થળ',
        'is_custom'       => false,
        'icon'            => 'bx bx-map',
        'search_terms'    => 'sthal sthal place સ્થળ'
    ],
    'adjective' => [
        'key'             => 'Adjective',
        'translation_key' => 'adjective',
        'gu'              => 'વિશેષણ',
        'is_custom'       => false,
        'icon'            => 'bx bx-text',
        'search_terms'    => 'visheshan adjective વિશેષણ'
    ],
    'name' => [
        'key'             => 'Name',
        'translation_key' => 'name',
        'gu'              => 'નામ',
        'is_custom'       => false,
        'icon'            => 'bx bx-tag',
        'search_terms'    => 'naam name નામ'
    ],
    'book' => [
        'key'             => 'Book',
        'translation_key' => 'book',
        'gu'              => 'પુસ્તક',
        'is_custom'       => false,
        'icon'            => 'bx bx-book',
        'search_terms'    => 'pustak book પુસ્તક'
    ],
    'bhav' => [
        'key'             => 'Bhav',
        'translation_key' => 'bhav',
        'gu'              => 'ભાવ',
        'is_custom'       => false,
        'icon'            => 'bx bx-heart',
        'search_terms'    => 'bhav emotion ભાવ'
    ],
    'custom' => [
        'key'             => null,
        'translation_key' => 'custom_category',
        'is_custom'       => true,
        'icon'            => 'bx bx-category',
        'search_terms'    => 'custom any અન્ય category'
    ],
];
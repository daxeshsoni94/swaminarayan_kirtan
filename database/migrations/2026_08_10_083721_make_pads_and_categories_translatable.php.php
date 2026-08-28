<?php
// database/migrations/xxxx_xx_xx_make_translatable_columns.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── pads ──────────────────────────────────────────────
        // Convert existing plain text → {"en": "..."} so nothing breaks
        $this->convertColumnToJson('pads', 'title');
        $this->convertColumnToJson('pads', 'value');

        // ── pad_media ─────────────────────────────────────────
        $this->convertColumnToJson('pad_media', 'singer');
        $this->convertColumnToJson('pad_media', 'publisher');
        $this->convertColumnToJson('pad_media', 'vocalization');

        // ── categories ────────────────────────────────────────
        $this->convertColumnToJson('categories', 'type');
        $this->convertColumnToJson('categories', 'value');
    }

    public function down(): void
    {
        // optional: reverse if needed
    }

    private function convertColumnToJson(string $table, string $column): void
    {
        // 1. Read existing values and wrap as {"en": value}
        $rows = DB::table($table)->select('id', $column)->get();

        foreach ($rows as $row) {
            $raw = $row->{$column};

            // already JSON?
            if (is_string($raw) && str_starts_with(trim($raw), '{')) {
                continue;
            }

            $json = json_encode(['en' => (string) ($raw ?? '')], JSON_UNESCAPED_UNICODE);
            DB::table($table)->where('id', $row->id)->update([$column => $json]);
        }

        // 2. Change column type to JSON (MySQL / MariaDB)
        Schema::table($table, function (Blueprint $table) use ($column) {
            $table->json($column)->nullable()->change();
        });
    }
};
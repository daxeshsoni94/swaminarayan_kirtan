    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        /**
         * Run the migrations.
         */
        public function up(): void
        {
            Schema::create('pads', function (Blueprint $table) {
                $table->id();

                $table->foreignId('kirtan_id')->constrained('kirtans')->cascadeOnDelete();
                $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();

                $table->text('title'); // Pad title
                $table->longText('value'); // Lyrics

                // JSON categories (array of IDs)
                $table->json('categories')->nullable();

                // Status
                $table->enum('status', ['save', 'draft'])->default('draft');

                // Date
                $table->date('establish_date')->nullable();

                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('pads');
        }
    };

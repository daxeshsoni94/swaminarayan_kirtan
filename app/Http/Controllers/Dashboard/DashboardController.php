<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Pad;
use App\Models\RecordedVersion; // adjust model name if different
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;


class DashboardController extends Controller
{
    public function index()
    {
        // dd([
        //     'app_locale' => app()->getLocale(),
        //     'session_locale' => session('locale'),
        //     'user_language_id' => Auth::user()?->language_id,
        // ]);
        $totalPads = Pad::count();
        // dd($totalPads);  
        $totalRecordings = Pad::whereHas('recordedVersion')->count();
        $publishedCount = Pad::where('status', 'save')->count();
        $draftCount = Pad::where('status', 'draft')->count();
        $withRecording = Pad::whereHas('recordedVersion')->count();
        $withoutRecording = max($totalPads - $withRecording, 0);

        // dd($withoutRecording);

        $publishedPercent = $totalPads > 0
            ? round(($publishedCount / $totalPads) * 100, 1)
            : 0;
        // dd($publishedPercent);

        $data = [];
        // dd($data);
        return Inertia::render('DashboardEcommerce/index', [
            // Widgets + ActivityOverview summary
            'stats' => [
                'total_pads'        => $totalPads,
                'total_recordings'  => $totalRecordings,
                'total_drafts'      => $draftCount,
                'total_published'   => $publishedCount,
                'published_percent' => $publishedPercent,
                'total_favorites' => Pad::query()
                    ->whereHas('favoritedByUsers', fn($q) => $q->where('user_id', Auth::id()))
                    ->count(),
            ],

            // ActivityOverview chart (last 12 months)
            'activity' => $this->buildActivityChart(),

            // PadsByStatus
            'padsByStatus' => [
                'total' => $totalPads,
                'items' => [
                    [
                        'label' => 'Published',
                        'value' => $this->pct($publishedCount, $totalPads),
                        'color' => 'success',
                    ],
                    [
                        'label' => 'Draft',
                        'value' => $this->pct($draftCount, $totalPads),
                        'color' => 'warning',
                    ],
                    [
                        'label' => 'With Recording',
                        'value' => $this->pct($withRecording, $totalPads),
                        'color' => 'primary',
                    ],
                    [
                        'label' => 'Without Recording',
                        'value' => $this->pct($withoutRecording, $totalPads),
                        'color' => 'info',
                    ],
                ],
            ],

            //Popular pads
            'popularPads' => Pad::query()
                ->withCount('categories')
                ->with(['categories:id,type,value', 'recordedVersion'])
                ->withCount(['recordedVersion as recordings_count']) // if hasOne, count is 0/1
                ->latest()
                ->take(5)
                ->get()
                ->map(fn(Pad $pad) => [
                    'id' => $pad->id,
                    'title' => $pad->title,
                    'date' => optional($pad->establish_date)?->format('Y-m-d')
                        ?? optional($pad->created_at)?->format('Y-m-d'),
                    'recordings' => $pad->recordedVersion ? 1 : 0,
                    'status' => $pad->status === 'save' ? 'Published' : 'Draft',
                    'categories' => $pad->categories->pluck('value')->take(2)->implode(', ') ?: '—',
                ])
                ->values(),
            'popularPadsTotal' => $totalPads,

            // CategoryBreakdown (donut by category type)
            'categoryBreakdown' => $this->buildCategoryBreakdown(),

            // RecentPads (was RecentKirtans)
            'recentPads' => Pad::query()
                ->latest('updated_at')
                ->take(5)
                ->get()
                ->map(fn(Pad $pad) => [
                    'id' => $pad->id,
                    'title' => $pad->title,
                    'status' => $pad->status === 'save' ? 'Published' : 'Draft',
                    'statusClass' => $pad->status === 'save' ? 'success' : 'warning',
                    'by' => 'Admin', // or $pad->creator?->name if you have relation
                    'date' => optional($pad->updated_at)?->format('d-m-Y'),
                ])
                ->values(),
        ]);
    }

    private function pct(int $part, int $total): int
    {
        return $total > 0 ? (int) round(($part / $total) * 100) : 0;
    }

    private function buildActivityChart(): array
    {
        $months = collect(range(0, 11))->map(
            fn($i) => Carbon::now()->subMonths(11 - $i)->startOfMonth()
        );

        $from = $months->first()->copy()->startOfMonth();
        $monthExpr = $this->monthExpression();

        $padMonthly = Pad::query()
            ->select(
                DB::raw("{$monthExpr} as ym"),
                DB::raw('COUNT(*) as total')
            )
            ->where('created_at', '>=', $from)
            ->groupBy('ym')
            ->pluck('total', 'ym');

        $categories = $months->map(fn($m) => $m->format('M'))->values()->all();

        $padsSeries = $months->map(
            fn($m) => (int) ($padMonthly[$m->format('Y-m')] ?? 0)
        )->values()->all();


        return [
            'categories' => $categories,
            'series' => [
                [
                    'name' => 'Pads',
                    'type' => 'bar',
                    'data' => $padsSeries,
                ],
                [
                    'name' => 'Recordings',
                    'type' => 'line',
                    // 'data' => $recordingsSeries,
                ],
            ],
        ];
    }

    private function buildCategoryBreakdown(): array
    {
        // Count pads per category type (pivot: category_pad or your pivot name)
        $rows = DB::table('categories')
            ->join('category_pad', 'categories.id', '=', 'category_pad.category_id') // adjust pivot table
            ->select('categories.type', DB::raw('COUNT(DISTINCT category_pad.pad_id) as total'))
            ->groupBy('categories.type')
            ->orderByDesc('total')
            ->get();

        if ($rows->isEmpty()) {
            return [
                'labels' => ['No data'],
                'series' => [1],
            ];
        }

        return [
            'labels' => $rows->pluck('type')->values()->all(),
            'series' => $rows->pluck('total')->map(fn($v) => (int) $v)->values()->all(),
        ];
    }


    private function monthExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', created_at)",
            default  => "DATE_FORMAT(created_at, '%Y-%m')",
        };
    }
}

<?php

namespace App\Support;

class FuelBar
{
    public static function render(int $porcentaje, int $width = 120, bool $showLabel = true): string
    {
        $clamped = max(0, min(100, $porcentaje));
        $fillWidth = round(($clamped / 100) * $width);

        $color = match (true) {
            $clamped <= 25 => '#ef4444',
            $clamped <= 50 => '#f59e0b',
            $clamped <= 75 => '#06b6d4',
            default => '#22c55e',
        };

        $bar = <<<HTML
            <div style="display:inline-flex;align-items:center;gap:6px;vertical-align:middle;">
                <div style="width:{$width}px;height:14px;background:#e5e7eb;border-radius:7px;overflow:hidden;border:1px solid #d1d5db;display:inline-block;">
                    <div style="width:{$fillWidth}px;height:100%;background:{$color};border-radius:7px;"></div>
                </div>
                <span style="font-size:11px;font-weight:bold;color:#374151;font-family:monospace;">{$clamped}%</span>
            </div>
        HTML;

        return $bar;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'language',
        'timezone',
        'date_format',
        'time_format',
        'currency_symbol',
        'email_notifications',
        'push_notifications',
        'sale_notifications',
        'purchase_notifications',
        'low_stock_alerts',
        'profile_visibility',
        'show_email',
        'show_phone',
    ];

    protected $casts = [
        'email_notifications' => 'boolean',
        'push_notifications' => 'boolean',
        'sale_notifications' => 'boolean',
        'purchase_notifications' => 'boolean',
        'low_stock_alerts' => 'boolean',
        'show_email' => 'boolean',
        'show_phone' => 'boolean',
    ];

    /**
     * Get the user that owns the settings.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
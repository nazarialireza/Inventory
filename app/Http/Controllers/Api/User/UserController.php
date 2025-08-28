<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSettings;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function getAuthenticatedUser()
    {
        $user_id = Auth::id();
        $user = User::find($user_id);
        $roles = $user->getRoleNames();
        $permissions = $user->getAllPermissions();

        return response()->json([
            'id' => $user_id,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'user_name' => $user->user_name,
                'email' => $user->email,
            ],
            'roles' => $roles,
            'permissions' => $permissions->pluck('name'),
        ]);
    }

    /**
     * Get user profile data
     */
    public function getProfile()
    {
        $user = Auth::user();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'city' => $user->city,
                'country' => $user->country,
                'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only([
            'name', 'email', 'phone', 'address', 'city', 'country'
        ]));

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'city' => $user->city,
                'country' => $user->country,
                'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]
        ]);
    }

    /**
     * Upload user avatar
     */
    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        /** @var User $user */
        $user = Auth::user();
        
        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::delete($user->avatar);
        }

        // Store new avatar
        $avatarPath = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $avatarPath]);

        return response()->json([
            'status' => 'success',
            'message' => 'Avatar updated successfully',
            'data' => [
                'avatar' => Storage::url($avatarPath)
            ]
        ]);
    }

    /**
     * Get user settings
     */
    public function getSettings()
    {
        /** @var User $user */
        $user = Auth::user();
        $settings = $user->settings ?? new UserSettings();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'language' => $settings->language ?? 'en',
                'timezone' => $settings->timezone ?? 'UTC',
                'date_format' => $settings->date_format ?? 'Y-m-d',
                'time_format' => $settings->time_format ?? '24',
                'currency_symbol' => $settings->currency_symbol ?? '$',
                'notifications' => [
                    'email_notifications' => $settings->email_notifications ?? true,
                    'push_notifications' => $settings->push_notifications ?? true,
                    'sale_notifications' => $settings->sale_notifications ?? true,
                    'purchase_notifications' => $settings->purchase_notifications ?? true,
                    'low_stock_alerts' => $settings->low_stock_alerts ?? true,
                ],
                'privacy' => [
                    'profile_visibility' => $settings->profile_visibility ?? 'public',
                    'show_email' => $settings->show_email ?? false,
                    'show_phone' => $settings->show_phone ?? false,
                ]
            ]
        ]);
    }

    /**
     * Update user settings
     */
    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'language' => 'required|in:en,prs',
            'timezone' => 'required|string|max:50',
            'date_format' => 'required|string|max:20',
            'time_format' => 'required|in:12,24',
            'currency_symbol' => 'nullable|string|max:5',
            'notifications.email_notifications' => 'boolean',
            'notifications.push_notifications' => 'boolean',
            'notifications.sale_notifications' => 'boolean',
            'notifications.purchase_notifications' => 'boolean',
            'notifications.low_stock_alerts' => 'boolean',
            'privacy.profile_visibility' => 'in:public,private',
            'privacy.show_email' => 'boolean',
            'privacy.show_phone' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        /** @var User $user */
        $user = Auth::user();
        $settings = $user->settings;
        
        // Create new settings if they don't exist
        if (!$settings) {
            $settings = new UserSettings();
            $settings->user_id = $user->id;
        }
        
        $settings->fill([
            'language' => $request->language,
            'timezone' => $request->timezone,
            'date_format' => $request->date_format,
            'time_format' => $request->time_format,
            'currency_symbol' => $request->currency_symbol,
            'email_notifications' => $request->input('notifications.email_notifications', true),
            'push_notifications' => $request->input('notifications.push_notifications', true),
            'sale_notifications' => $request->input('notifications.sale_notifications', true),
            'purchase_notifications' => $request->input('notifications.purchase_notifications', true),
            'low_stock_alerts' => $request->input('notifications.low_stock_alerts', true),
            'profile_visibility' => $request->input('privacy.profile_visibility', 'public'),
            'show_email' => $request->input('privacy.show_email', false),
            'show_phone' => $request->input('privacy.show_phone', false),
        ]);
        
        $settings->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully',
            'data' => [
                'language' => $settings->language,
                'timezone' => $settings->timezone,
                'date_format' => $settings->date_format,
                'time_format' => $settings->time_format,
                'currency_symbol' => $settings->currency_symbol,
                'notifications' => [
                    'email_notifications' => $settings->email_notifications,
                    'push_notifications' => $settings->push_notifications,
                    'sale_notifications' => $settings->sale_notifications,
                    'purchase_notifications' => $settings->purchase_notifications,
                    'low_stock_alerts' => $settings->low_stock_alerts,
                ],
                'privacy' => [
                    'profile_visibility' => $settings->profile_visibility,
                    'show_email' => $settings->show_email,
                    'show_phone' => $settings->show_phone,
                ]
            ]
        ]);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        /** @var User $user */
        $user = Auth::user();

        // Check current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'errors' => ['current_password' => ['Current password is incorrect']]
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * Get user notifications
     */
    public function getNotifications(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $perPage = $request->get('per_page', 10);
        $filter = $request->get('filter', 'all');
        
        $query = $user->notifications();
        
        // Apply filters
        if ($filter === 'unread') {
            $query->whereNull('read_at');
        } elseif ($filter === 'read') {
            $query->whereNotNull('read_at');
        } elseif ($filter !== 'all') {
            $query->where('type', $filter);
        }
        
        $notifications = $query->orderBy('created_at', 'desc')
                              ->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'data' => $notifications->items(),
            'total' => $notifications->total(),
            'current_page' => $notifications->currentPage(),
            'per_page' => $notifications->perPage(),
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markNotificationAsRead($id)
    {
        /** @var User $user */
        $user = Auth::user();
        $notification = $user->notifications()->find($id);
        
        if (!$notification) {
            return response()->json([
                'status' => 'error',
                'message' => 'Notification not found'
            ], 404);
        }
        
        $notification->markAsRead();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Notification marked as read'
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllNotificationsAsRead()
    {
        /** @var User $user */
        $user = Auth::user();
        $user->unreadNotifications->markAsRead();
        
        return response()->json([
            'status' => 'success',
            'message' => 'All notifications marked as read'
        ]);
    }

    /**
     * Delete notification
     */
    public function deleteNotification($id)
    {
        /** @var User $user */
        $user = Auth::user();
        $notification = $user->notifications()->find($id);
        
        if (!$notification) {
            return response()->json([
                'status' => 'error',
                'message' => 'Notification not found'
            ], 404);
        }
        
        $notification->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Notification deleted successfully'
        ]);
    }

    /**
     * Clear all notifications
     */
    public function clearAllNotifications()
    {
        /** @var User $user */
        $user = Auth::user();
        $user->notifications()->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'All notifications cleared successfully'
        ]);
    }
}

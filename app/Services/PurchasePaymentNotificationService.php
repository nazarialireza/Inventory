<?php

namespace App\Services;

use App\Models\Invoice\Invoice;
use App\Models\UserNotification;
use App\Models\User;
use Carbon\Carbon;

class PurchasePaymentNotificationService
{
    /**
     * Check for unpaid or partially paid purchases and send notifications
     */
    public function sendPaymentReminderNotifications()
    {
        // Get all purchase invoices that are not fully paid
        $unpaidPurchases = Invoice::where('type', 'purchase')
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->where('due_amount', '>', 0)
            ->with(['party', 'creator'])
            ->get();

        foreach ($unpaidPurchases as $purchase) {
            // Check if we should send a notification (e.g., if payment is overdue)
            if ($this->shouldSendReminder($purchase)) {
                $this->createPaymentReminderNotification($purchase);
            }
        }
    }

    /**
     * Determine if a payment reminder should be sent
     */
    protected function shouldSendReminder($purchase)
    {
        // For testing purposes, always return true
        return true;
        
        // If there's a payment deadline, check if it's overdue
        if ($purchase->payment_deadline) {
            $deadline = Carbon::parse($purchase->payment_deadline);
            // Send reminder if deadline has passed
            return $deadline->isPast();
        }

        // If no deadline, send reminder based on invoice date (e.g., after 7 days)
        $invoiceDate = Carbon::parse($purchase->invoice_date);
        return $invoiceDate->diffInDays(Carbon::now()) >= 7;
    }

    /**
     * Create a payment reminder notification for a purchase
     */
    protected function createPaymentReminderNotification($purchase)
    {
        // Get users who should receive this notification (users with view_purchase permission either directly or through roles)
        $users = User::whereHas('permissions', function ($query) {
            $query->where('name', 'view_purchase');
        })->orWhereHas('roles.permissions', function ($query) {
            $query->where('name', 'view_purchase');
        })->get();

        $title = 'Purchase Payment Reminder';
        $message = "Purchase #{$purchase->invoice_ref} from {$purchase->party->name} has an outstanding balance of {$purchase->due_amount}. Payment status: {$purchase->payment_status}.";

        foreach ($users as $user) {
            // Check if notification already exists to avoid duplicates
            $existingNotification = UserNotification::where('user_id', $user->id)
                ->where('type', 'purchase')
                ->where('data->invoice_id', $purchase->id)
                ->whereNull('read_at')
                ->first();

            if (!$existingNotification) {
                UserNotification::create([
                    'user_id' => $user->id,
                    'type' => 'purchase',
                    'title' => $title,
                    'message' => $message,
                    'data' => [
                        'invoice_id' => $purchase->id,
                        'invoice_ref' => $purchase->invoice_ref,
                        'party_name' => $purchase->party->name,
                        'due_amount' => $purchase->due_amount,
                        'payment_status' => $purchase->payment_status,
                    ],
                ]);
            }
        }
    }

    /**
     * Send immediate notification when a purchase is created with unpaid status
     */
    public function sendNewUnpaidPurchaseNotification($purchase)
    {
        // Only send notification if the purchase is unpaid or partial
        if (!in_array($purchase->payment_status, ['unpaid', 'partial'])) {
            return;
        }

        // Get users who should receive this notification (users with view_purchase permission either directly or through roles)
        $users = User::whereHas('permissions', function ($query) {
            $query->where('name', 'view_purchase');
        })->orWhereHas('roles.permissions', function ($query) {
            $query->where('name', 'view_purchase');
        })->get();

        $title = 'New Unpaid Purchase';
        $message = "A new purchase #{$purchase->invoice_ref} from {$purchase->party->name} has been created with payment status: {$purchase->payment_status}. Amount due: {$purchase->due_amount}.";

        foreach ($users as $user) {
            UserNotification::create([
                'user_id' => $user->id,
                'type' => 'purchase',
                'title' => $title,
                'message' => $message,
                'data' => [
                    'invoice_id' => $purchase->id,
                    'invoice_ref' => $purchase->invoice_ref,
                    'party_name' => $purchase->party->name,
                    'due_amount' => $purchase->due_amount,
                    'payment_status' => $purchase->payment_status,
                ],
            ]);
        }
    }
}
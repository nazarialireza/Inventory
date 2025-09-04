<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\PurchasePaymentNotificationService;

class SendPurchasePaymentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:send-purchase-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send payment reminder notifications for unpaid or partially paid purchases';

    /**
     * Execute the console command.
     */
    public function handle(PurchasePaymentNotificationService $notificationService)
    {
        $this->info('Sending purchase payment reminders...');
        
        $notificationService->sendPaymentReminderNotifications();
        
        $this->info('Purchase payment reminders sent successfully!');
    }
}
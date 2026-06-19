import { sendConfirmationEmail } from './emailService';
import type { BuyerInfo } from '@/types/checkout';

export interface EmailJob {
  ticketId: string;
  orderId: string;
  buyerInfo: BuyerInfo;
  quantity?: number;
  attempts: number;
}

// Persist email queue in Next.js development across hot-reloads
const globalForEmailQueue = globalThis as unknown as {
  emailQueue?: EmailJob[];
  isProcessing?: boolean;
};

const emailQueue = globalForEmailQueue.emailQueue ?? [];
globalForEmailQueue.emailQueue = emailQueue;

const MAX_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 5000; // 5 seconds initial delay

if (globalForEmailQueue.isProcessing === undefined) {
  globalForEmailQueue.isProcessing = false;
}

/**
 * Adds an email job to the queue and triggers execution in the background
 */
export function addEmailToQueue(jobData: Omit<EmailJob, 'attempts'>) {
  const job: EmailJob = {
    ...jobData,
    attempts: 0,
  };

  emailQueue.push(job);
  console.log(`[EmailQueue] Queued email confirmation for ${job.buyerInfo.email} (Order: ${job.orderId})`);
  
  // Start the queue runner if it's not already running
  if (!globalForEmailQueue.isProcessing) {
    processQueue();
  }
}

/**
 * Queue runner loop
 */
async function processQueue() {
  if (globalForEmailQueue.isProcessing) return;
  globalForEmailQueue.isProcessing = true;

  while (emailQueue.length > 0) {
    const job = emailQueue.shift();
    if (!job) continue;

    try {
      console.log(`[EmailQueue] Processing job for ${job.buyerInfo.email}. Attempt ${job.attempts + 1}/${MAX_ATTEMPTS}`);
      
      // Send the email
      await sendConfirmationEmail({
        ticketId: job.ticketId,
        orderId: job.orderId,
        buyerInfo: job.buyerInfo,
        quantity: job.quantity,
      });

      console.log(`[EmailQueue] ✅ Email successfully sent to ${job.buyerInfo.email} for order ${job.orderId}`);
    } catch (error) {
      console.error(`[EmailQueue] ❌ Error sending email to ${job.buyerInfo.email}:`, error);
      
      job.attempts += 1;
      
      if (job.attempts < MAX_ATTEMPTS) {
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, job.attempts - 1);
        console.log(`[EmailQueue] Rescheduling email for ${job.buyerInfo.email} in ${delay / 1000}s (Attempt ${job.attempts + 1}/${MAX_ATTEMPTS})`);
        
        // Wait and put back in queue
        setTimeout(() => {
          emailQueue.push(job);
          if (!globalForEmailQueue.isProcessing) {
            processQueue();
          }
        }, delay);
      } else {
        console.error(`[EmailQueue] 🚨 Max attempts (${MAX_ATTEMPTS}) reached. Email delivery failed for ${job.buyerInfo.email}`);
      }
    }
  }

  globalForEmailQueue.isProcessing = false;
}

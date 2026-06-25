import { sendConfirmationEmail } from './emailService';
import type { BuyerInfo } from '@/types/checkout';

export interface EmailJob {
  ticketId: string;
  orderId: string;
  buyerInfo: BuyerInfo;
  quantity?: number;
}

const MAX_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 2000;

/**
 * Sends a confirmation email and awaits completion, with built-in retry logic.
 */
export async function addEmailToQueue(jobData: EmailJob) {
  let attempts = 0;
  
  console.log(`[EmailQueue] Queued email confirmation for ${jobData.buyerInfo.email} (Order: ${jobData.orderId})`);
  
  while (attempts < MAX_ATTEMPTS) {
    try {
      attempts++;
      console.log(`[EmailQueue] Processing job for ${jobData.buyerInfo.email}. Attempt ${attempts}/${MAX_ATTEMPTS}`);
      
      // Send the email
      await sendConfirmationEmail({
        ticketId: jobData.ticketId,
        orderId: jobData.orderId,
        buyerInfo: jobData.buyerInfo,
        quantity: jobData.quantity,
      });

      console.log(`[EmailQueue] ✅ Email successfully sent to ${jobData.buyerInfo.email} for order ${jobData.orderId}`);
      return; // Success, exit function
    } catch (error) {
      console.error(`[EmailQueue] ❌ Error sending email to ${jobData.buyerInfo.email} on attempt ${attempts}:`, error);
      
      if (attempts < MAX_ATTEMPTS) {
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempts - 1);
        console.log(`[EmailQueue] Rescheduling email for ${jobData.buyerInfo.email} in ${delay / 1000}s (Attempt ${attempts + 1}/${MAX_ATTEMPTS})`);
        
        // Wait inline
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(`[EmailQueue] 🚨 Max attempts (${MAX_ATTEMPTS}) reached. Email delivery failed for ${jobData.buyerInfo.email}`);
        throw error;
      }
    }
  }
}


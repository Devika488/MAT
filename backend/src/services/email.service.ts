import { Request, Response, NextFunction } from 'express';

const getBaseUrl = () => {
  const url = process.env.FRONTEND_URL || 'https://myayurvedatrip.netlify.app';
  return url.replace(/\/$/, '');
};

export const emailService = {
  async sendBookingConfirmation(bookingData: {
    traveller_name: string;
    email: string;
    retreat_name: string;
    location: string;
    check_in: string;
    check_out: string;
    price: string;
  }) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@myayurvedatrip.com';
    const baseUrl = getBaseUrl();



    if (!apiKey) {
      console.error('BREVO_API_KEY is missing in environment variables');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf9f6; color: #4a4a4a;">
    <div style="display:none !important; visibility:hidden; mso-hide:all; font-size:1px; color:#ffffff; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
        Booking Reference update: ${Date.now()}
    </div>
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #faf9f6;">
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
            <tr>
                <td style="font-family: 'Georgia', serif; font-size: 24px; color: #2c4a3e; letter-spacing: 2px;">
                    <img src="${baseUrl}/logo.png" alt="MTA Logo" height="40" style="display: block; border: 0;">
                </td>
                <td style="text-align: right; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">
                </td>
            </tr>
        </table>

        <!-- Hero -->
        <div style="margin-bottom: 50px; text-align: center;">
            <img src="${baseUrl}/images/rasayana.jpg" alt="MTA Sanctuary" style="width: 100%; max-width: 600px; border-radius: 12px; display: block; border: 0;">
        </div>

        <!-- Title -->
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-family: 'Georgia', serif; font-size: 42px; color: #2c4a3e; font-weight: normal; margin: 0 0 25px 0;">Your Sanctuary is Reserved</h1>
            <p style="font-size: 15px; color: #666; line-height: 1.6; margin: 0 auto; max-width: 500px;">
                Dear ${bookingData.traveller_name},<br><br>
                We are honored that you have chosen MTA Ayurvedic Sanctuary for your journey toward balance. Your space in our garden of healing is now secured. We look forward to welcoming you home.
            </p>
        </div>

        <!-- Summary Card -->
        <div style="background-color: #efede8; border-radius: 16px; padding: 40px; margin-bottom: 60px;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="vertical-align: top; padding-bottom: 30px;">
                        <span style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">THE RETREAT</span>
                        <span style="font-family: 'Georgia', serif; font-size: 24px; color: #2c4a3e; font-weight: normal; line-height: 1.2;">${bookingData.retreat_name}</span>
                    </td>
                    <td style="text-align: right; vertical-align: top; padding-bottom: 30px;">
                        <span style="font-family: 'Georgia', serif; font-style: italic; font-size: 14px; color: #888; display: block; margin-bottom: 5px;">Investment in Self</span>
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;">
                        <p style="font-size: 13px; color: #4a4a4a; margin: 0;"><strong>Dates:</strong> ${new Date(bookingData.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(bookingData.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p style="font-size: 13px; color: #4a4a4a; margin: 10px 0;"><strong>Location:</strong> ${bookingData.location}</p>
                    </td>
                    <td style="text-align: right; vertical-align: bottom;">
                        <span style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">Amount Paid</span>
                        <span style="font-size: 32px; color: #2c4a3e; font-weight: bold;">$${Number(bookingData.price).toLocaleString()}</span>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; border-top: 1px solid #efede8; padding-top: 40px; color: #888; font-size: 14px;">
            <p style="margin-bottom: 5px; color: #2c4a3e; font-weight: bold; font-size: 16px;">My Ayurveda Trip</p>
            <p style="margin-bottom: 20px; color: #999;">${bookingData.location}</p>
            <p style="margin-bottom: 30px;">
                <a href="mailto:myAyurvedaTrip@mock.com" style="color: #0066cc; text-decoration: underline;">myAyurvedaTrip@mock.com</a> 
                <span style="color: #666;"> | +62 361 975 000</span>
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 30px;">© ${new Date().getFullYear()} My Ayurveda Trip. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'MTA Sanctuary', email: senderEmail },
          to: [{ email: bookingData.email, name: bookingData.traveller_name }],
          subject: 'Your Sanctuary is Reserved',
          htmlContent: htmlContent
        })
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Brevo API Error:', err);
      }
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  },

  async sendCancellationEmail(bookingData: {
    booking_id: number;
    traveller_name: string;
    email: string;
    retreat_name: string;
    location: string;
    check_in: string;
    check_out: string;
  }) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@myayurvedatrip.com';
    const baseUrl = getBaseUrl();



    if (!apiKey) {
      console.error('BREVO_API_KEY is missing');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf9f6; color: #4a4a4a;">
    <div style="display:none !important; visibility:hidden; mso-hide:all; font-size:1px; color:#ffffff; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
        Cancellation Reference: ${bookingData.booking_id} - ${Math.random().toString(36).substring(7)} - ${Date.now()}
    </div>
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #faf9f6;">
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
            <tr>
                <td style="font-family: 'Georgia', serif; font-size: 24px; color: #2c4a3e; letter-spacing: 2px;">
                    <img src="${baseUrl}/logo.png" alt="MTA Logo" height="40" style="display: block; border: 0;">
                </td>
                <td style="text-align: right; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">
                </td>
            </tr>
        </table>

        <!-- Hero -->
        <div style="margin-bottom: 50px; text-align: center;">
            <img src="${baseUrl}/images/detox.jpg" alt="Serene Sanctuary" style="width: 100%; max-width: 600px; border-radius: 12px; display: block; border: 0;">
        </div>

        <!-- Title -->
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-family: 'Georgia', serif; font-size: 42px; color: #2c4a3e; font-weight: normal; margin: 0 0 25px 0;">Your Sanctuary Reservation Has Been Cancelled</h1>
            <p style="font-size: 15px; color: #666; line-height: 1.6; margin: 0 auto; max-width: 500px;">
                Dear ${bookingData.traveller_name},<br><br>
                Breath by breath, we acknowledge the shifts in your journey. Per your request or administrative action, your upcoming stay is no longer scheduled.
            </p>
        </div>

        <!-- Summary Card -->
        <div style="background-color: #efede8; border-radius: 16px; padding: 40px; margin-bottom: 60px;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="vertical-align: top;">
                        <span style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">BOOKING ID</span>
                        <span style="font-size: 18px; color: #4a4a4a; font-weight: 500; display: block; margin-bottom: 20px;">#MTA-${bookingData.booking_id.toString().padStart(4, '0')}</span>
                        
                        <span style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">RETREAT NAME</span>
                        <span style="font-family: 'Georgia', serif; font-size: 22px; color: #2c4a3e; font-weight: normal;">${bookingData.retreat_name}</span>
                    </td>
                    <td style="text-align: right; vertical-align: top;">
                        <span style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">ORIGINAL DATES</span>
                        <span style="font-size: 14px; color: #4a4a4a; font-weight: 500;">${new Date(bookingData.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(bookingData.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; border-top: 1px solid #efede8; padding-top: 40px; color: #888; font-size: 14px;">
            <p style="margin-bottom: 5px; color: #2c4a3e; font-weight: bold; font-size: 16px;">My Ayurveda Trip</p>
            <p style="margin-bottom: 20px; color: #999;">${bookingData.location}</p>
            <p style="margin-bottom: 30px;">
                <a href="mailto:myAyurvedaTrip@mock.com" style="color: #0066cc; text-decoration: underline;">myAyurvedaTrip@mock.com</a> 
                <span style="color: #666;"> | +62 361 975 000</span>
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 30px;">© ${new Date().getFullYear()} My Ayurveda Trip. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'My Ayurveda Trip', email: senderEmail },
          to: [{ email: bookingData.email, name: bookingData.traveller_name }],
          subject: 'Your Sanctuary Reservation Has Been Cancelled',
          htmlContent: htmlContent
        })
      });

    } catch (error) {
      console.error('Failed to send cancellation email:', error);
    }
  }
};

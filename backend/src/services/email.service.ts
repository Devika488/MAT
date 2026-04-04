import { Request, Response, NextFunction } from 'express';

export const emailService = {
  async sendBookingConfirmation(bookingData: {
    traveller_name: string;
    email: string;
    retreat_name: string;
    location: string;
    room_type: string;
    check_in: string;
    check_out: string;
    price: string;
  }) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@myayurvedatrip.com';

    if (!apiKey) {
      console.error('BREVO_API_KEY is missing in environment variables');
      return;
    }

    const currentYear = new Date().getFullYear();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f7f2; margin: 0; padding: 0; color: #333; }
        .container { max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .header { padding: 40px 30px; text-align: center; background-color: #f9f7f2; }
        .logo-img { height: 60px; width: auto; margin-bottom: 10px; }
        .hero-img { width: 100%; height: 300px; object-fit: cover; }
        .content { padding: 40px; text-align: center; background-color: #fff; }
        h1 { font-family: 'Georgia', serif; color: #2c4a3e; font-size: 28px; margin-bottom: 20px; font-weight: normal; }
        p { line-height: 1.6; color: #666; margin-bottom: 20px; }
        .details-box { background-color: #f4f1ea; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: left; display: flex; justify-content: space-between; align-items: flex-start; }
        .details-left { flex: 1; }
        .details-right { flex: 1; text-align: right; border-left: 1px solid #ddd; padding-left: 20px; }
        .label { font-size: 10px; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 5px; display: block; }
        .value { font-size: 18px; color: #2c4a3e; font-weight: 500; margin-bottom: 15px; display: block; }
        .price-label { font-family: 'Georgia', serif; font-style: italic; color: #888; font-size: 14px; margin-bottom: 10px; display: block; }
        .price { font-size: 24px; color: #2c4a3e; font-weight: bold; }
        .footer { background-color: #f9f7f2; padding: 40px; text-align: center; border-top: 1px solid #eee; }
        .footer-title { font-family: 'Georgia', serif; font-size: 18px; color: #2c4a3e; margin-bottom: 10px; }
        .footer-info { font-size: 12px; color: #999; margin-bottom: 20px; line-height: 1.5; }
        .copyright { font-size: 10px; color: #bbb; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MTA</div>
        </div>
        
        <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000" alt="Resort Sanctuary" class="hero-img">
        
        <div class="content">
            <h1>Your Sanctuary is Reserved</h1>
            <p>Dear ${bookingData.traveller_name},</p>
            <p>We are honored that you have chosen MTA Ayurvedic Sanctuary for your journey toward balance. Your space in our garden of healing is now secured. We look forward to welcoming you home to Ubud.</p>
            
            <div class="details-box">
                <div class="details-left">
                    <span class="label">THE RETREAT</span>
                    <span class="value">${bookingData.retreat_name}</span>
                    
                    <span class="label">DATES</span>
                    <span class="value">${new Date(bookingData.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(bookingData.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    
                    <span class="label">ROOM</span>
                    <span class="value">${bookingData.room_type}</span>
                </div>
                <div class="details-right">
                    <span class="price-label">Investment in Self</span>
                    <p style="font-size: 11px; margin: 0 0 20px 0; color: #aaa;">Total inclusive of all organic meals, daily rituals, and holistic consultations.</p>
                    <span class="label">Amount Paid</span>
                    <span class="price">$${Number(bookingData.price).toLocaleString()}</span>
                </div>
            </div>

            <div style="margin-top: 50px;">
                <h2 style="font-family: 'Georgia', serif; font-size: 22px; color: #2c4a3e; margin-bottom: 30px;">Preparing for Your Journey</h2>
                <div style="display: flex; justify-content: space-between; text-align: left; gap: 15px;">
                    <div style="flex: 1; background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <span style="font-size: 20px; display: block; margin-bottom: 10px;">📋</span>
                        <b style="font-size: 14px; color: #2c4a3e; display: block; margin-bottom: 10px;">Packing Guide</b>
                        <p style="font-size: 11px; color: #777; margin: 0;">Opt for natural, breathable fabrics. We provide traditional sarongs and slippers for your rituals.</p>
                    </div>
                    <div style="flex: 1; background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <span style="font-size: 20px; display: block; margin-bottom: 10px;">🧘</span>
                        <b style="font-size: 14px; color: #2c4a3e; display: block; margin-bottom: 10px;">Consultation Call</b>
                        <p style="font-size: 11px; color: #777; margin: 0;">A Vedya (Ayurvedic doctor) will contact you next week to discuss your home and personal goals.</p>
                    </div>
                    <div style="flex: 1; background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <span style="font-size: 20px; display: block; margin-bottom: 10px;">🏡</span>
                        <b style="font-size: 14px; color: #2c4a3e; display: block; margin-bottom: 10px;">Arrival</b>
                        <p style="font-size: 11px; color: #777; margin: 0;">Our private concierge will meet you at Denpasar Airport for a quiet transfer through the rice fields.</p>
                    </div>
                </div>
            </div>
            
            <p style="font-size: 12px; font-style: italic; margin-top: 40px;">Need to adjust your reservation? Reply directly to this email.</p>
        </div>

        
        <div class="footer">
            <div class="footer-title">${bookingData.retreat_name}</div>
            <div class="footer-info">
                ${bookingData.location}<br>
                sample.email@mta-sanctuary.com | +62 361 975 000
            </div>
            <div class="copyright">
                © ${currentYear} MAT Ayurvedic Sanctuary. All rights reserved.
            </div>
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
      } else {
        console.log(`Confirmation email sent to ${bookingData.email}`);
      }
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  }
};

import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@nutritionu.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized');
} else {
  console.warn('⚠️ SENDGRID_API_KEY not set - email sending will be disabled');
}

// Welcome email template
export const sendWelcomeEmail = async (email: string, displayName?: string) => {
  // Skip if no API key configured
  if (!SENDGRID_API_KEY) {
    console.log(`⚠️ Email sending disabled (no API key). Would have sent welcome email to: ${email}`);
    return { success: true, skipped: true };
  }

  const greeting = displayName ? `Hi ${displayName}` : 'Hi there';
  
  const msg = {
    to: email,
    from: SENDGRID_FROM_EMAIL,
    subject: "Welcome to Nutrition U!",
      html: `<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0; font-family: 'Inter', Arial, sans-serif;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Nutrition U</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f7f7fb; font-family: 'Inter', Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7fb; padding:40px 0;">
      <tr>
        <td align="center">

          <!-- Card Container -->
          <table width="600" cellpadding="0" cellspacing="0" style="
            background:#ffffff;
            border-radius:20px;
            padding:40px;
            box-shadow:0 8px 30px rgba(0,0,0,0.06);
          ">

            <!-- Logo -->
            <tr>
              <td align="center" style="padding-bottom:25px;">
                <img 
                  src="http://cdn.mcauto-images-production.sendgrid.net/31ece1d386917071/ff8450a0-0c01-4043-8a8c-6cc8d9b61a00/500x500.png"
                  alt="Nutrition U" 
                  width="160" 
                  style="display:block; margin:0 auto;"
                />
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td align="center" style="padding-bottom:10px;">
                <h1 style="
                  font-size:28px;
                  font-weight:800;
                  color:#333;
                  margin:0;
                  font-family: 'Inter', Arial, sans-serif;
                ">
                  Welcome to Nutrition U 🎉
                </h1>
              </td>
            </tr>

            <!-- Subtitle -->
            <tr>
              <td align="center" style="padding-bottom:30px;">
                <p style="
                  font-size:16px;
                  color:#555;
                  max-width:460px;
                  line-height:1.6;
                  margin:0 auto;
                ">
                  Yes -- Nutrition tailored to <strong>YOU</strong>!
                </p>
              </td>
            </tr>

            <!-- Body Text -->
            <tr>
              <td style="padding-bottom:25px;">
                <p style="
                  font-size:15px;
                  color:#444;
                  line-height:1.7;
                  margin:0;
                ">
                  ${greeting}! 👋
                </p>
                <p style="
                  font-size:15px;
                  color:#444;
                  line-height:1.7;
                  margin:10px 0 0 0;
                ">
                  We know how difficult it can be to meal prep and figure out what to eat (and when).
                  That's why we created <strong>Nutrition U</strong> ; to make eating in college
                  stress-free, simple, and most importantly, affordable.
                </p>
              </td>
            </tr>

            <!-- Feature List -->
            <tr>
              <td style="padding-bottom:20px;">
                <h3 style="
                  font-size:18px;
                  color:#333;
                  margin:0 0 10px 0;
                  font-weight:700;
                ">Here's what you can look forward to:</h3>

                <ul style="
                  padding-left:20px;
                  color:#444;
                  font-size:15px;
                  line-height:1.7;
                ">
                  <li>Weekly prep plans to help you save time and stay consistent.</li>
                  <li>Personalized recommendations based on your goals and dietary needs.</li>
                  <li>Smartly budgeted ingredients that won't break your wallet.</li>
                  <li>An AI assistant to help you reach your goals and answer your questions.</li>
                </ul>
              </td>
            </tr>

            <!-- Closing Message -->
            <tr>
              <td style="padding-bottom:35px;">
                <p style="
                  font-size:15px;
                  color:#444;
                  line-height:1.7;
                  margin:0;
                ">
                  We're happy you're part of the team and can't wait to see everything you accomplish.
                </p>
              </td>
            </tr>

            <!-- Signature -->
            <tr>
              <td style="padding-bottom:20px; text-align:center;">
                <p style="
                  font-size:15px;
                  color:#555;
                  margin:0;
                  font-weight:600;
                ">
                  - The Nutrition U Team
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
</html>`,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Welcome email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return { success: false, error };
  }
};

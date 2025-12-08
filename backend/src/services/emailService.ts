import nodemailer from 'nodemailer';

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
  rateDelta: 1000,
  rateLimit: 3,
  socketTimeout: 60000,  // 60 seconds
  greetingTimeout: 30000, // 30 seconds
  connectionTimeout: 60000, // 60 seconds
});

// Welcome email template
export const sendWelcomeEmail = async (email: string, displayName?: string) => {
  const greeting = displayName ? `Hi ${displayName}` : 'Hi there';
  
  try {
    await transporter.sendMail({
      from: `"Nutrition U" <${process.env.EMAIL_USER}>`,
      to: email,
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
                  src="data:image/png;base64,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"
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
                  Yes — Nutrition tailored to <strong>YOU</strong>!
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
                  That's why we created <strong>Nutrition U</strong> ; sto make eating in college
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
                  — The Nutrition U Team
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
</html>`,
    });

    console.log(`✅ Welcome email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error };
  }
};

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Use a valid hostname for EHLO command
  name: 'localhost',
  // Add connection timeout and retry settings
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000,   // 30 seconds
  socketTimeout: 60000,     // 60 seconds
  // Add TLS options for better compatibility
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  // Add debug option for troubleshooting
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development'
});

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send email using nodemailer with retry logic
 */
export const sendEmail = async (options: EmailOptions, retries: number = 3): Promise<void> => {
  const mailOptions = {
    from: `"${process.env.SMTP_NAME || 'Nan Ayeyar'}" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Verify connection before sending
      if (attempt === 1) {
        await transporter.verify();
        console.log('SMTP connection verified successfully');
      }

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${options.to} from ${mailOptions.from} (attempt ${attempt})`);
      return; // Success, exit the function
    } catch (error: any) {
      console.error(`Email sending failed (attempt ${attempt}/${retries}):`, {
        error: error.message,
        code: error.code,
        command: error.command
      });

      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw new Error(`Failed to send email after ${retries} attempts: ${error.message}`);
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Get OTP email template based on language
 */
export const getOTPEmailTemplate = (otp: string, language: string = 'en', type: 'verification' | 'password-reset' = 'verification') => {
  if (language === 'my') {
    const isPasswordReset = type === 'password-reset';
    const title = isPasswordReset ? 'စကားဝှက် ပြန်လည်သတ်မှတ်ရန် OTP ကုဒ်' : 'အကောင့်အတည်ပြုရန် OTP ကုဒ်';
    const description = isPasswordReset 
      ? 'သင့်စကားဝှက်ကို ပြန်လည်သတ်မှတ်ရန် အောက်ပါ OTP ကုဒ်ကို အသုံးပြုပါ။'
      : 'သင့်အကောင့်ကို အတည်ပြုရန် အောက်ပါ OTP ကုဒ်ကို အသုံးပြုပါ။';
    const usage = isPasswordReset
      ? [
          'စကားဝှက် ပြန်လည်သတ်မှတ်ရန် စာမျက်နှာသို့ သွားပါ',
          `အောက်ပါ OTP ကုဒ်ကို ရိုက်ထည့်ပါ: ${otp}`,
          'စကားဝှက် အသစ်ကို ထည့်သွင်းပြီး "ပြန်လည်သတ်မှတ်ပါ" ခလုတ်ကို နှိပ်ပါ'
        ]
      : [
          'သင့်အကောင့်အတည်ပြုရန် စာမျက်နှာသို့ သွားပါ',
          `အောက်ပါ OTP ကုဒ်ကို ရိုက်ထည့်ပါ: ${otp}`,
          '"အတည်ပြုပါ" ခလုတ်ကို နှိပ်ပါ'
        ];

    return {
      subject: isPasswordReset ? 'စကားဝှက် ပြန်လည်သတ်မှတ်ရန် ကုဒ် - Nan Ayeyar' : 'OTP ကုဒ် - Nan Ayeyar',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0ea5e9; margin: 0;">🌾 Nan Ayeyar</h1>
            <p style="color: #666; margin: 5px 0;">အရည်အသွေးမြင့် ဆန်ကုန်သွယ်ရေး ပလက်ဖောင်း</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">${title}</h2>
            <p style="color: #374151; text-align: center; margin-bottom: 20px; font-size: 16px;">
              ${description}
            </p>
            <div style="background-color: #ffffff; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px solid #e5e7eb;">
              <h1 style="color: #0ea5e9; font-size: 36px; margin: 0; letter-spacing: 5px; font-family: monospace;">${otp}</h1>
            </div>
            <p style="color: #374151; text-align: center; margin: 0; font-size: 14px;">
              ဤကုဒ်ကို ${isPasswordReset ? 'စကားဝှက် ပြန်လည်သတ်မှတ်ရန်' : 'သင့်အကောင့်အတည်ပြုရန်'} အသုံးပြုပါ
            </p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px; text-align: center;">
              ⚠️ ဤကုဒ်သည် ၁၀ မိနစ်အတွင်း သက်တမ်းကုန်ဆုံးမည်။
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px;">အသုံးပြုနည်း:</h3>
            <ol style="color: #374151; margin: 0; padding-left: 20px; font-size: 14px;">
              ${usage.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              ဤကုဒ်ကို မည်သူနှင့်မျှ မျှဝေမပေးပါနှင့်။<br>
              သင့်အကောင့်လုံခြုံရေးအတွက် ဤကုဒ်ကို လျှို့ဝှက်ထားပါ။<br>
              ဤအီးမေးလ်ကို သင်တောင်းဆိုခြင်း မရှိပါက၊ ကျေးဇူးပြု၍ လျစ်လျူရှုပါ။
            </p>
          </div>
        </div>
      `,
      text: `Nan Ayeyar - ${isPasswordReset ? 'စကားဝှက် ပြန်လည်သတ်မှတ်ရန်' : 'OTP'} ကုဒ်: ${otp}

သင့်အကောင့်ကို အတည်ပြုရန် အောက်ပါ OTP ကုဒ်ကို အသုံးပြုပါ။

OTP ကုဒ်: ${otp}

အသုံးပြုနည်း:
1. သင့်အကောင့်အတည်ပြုရန် စာမျက်နှာသို့ သွားပါ
2. အောက်ပါ OTP ကုဒ်ကို ရိုက်ထည့်ပါ: ${otp}
3. "အတည်ပြုပါ" ခလုတ်ကို နှိပ်ပါ

ဤကုဒ်သည် ၁၀ မိနစ်အတွင်း သက်တမ်းကုန်ဆုံးမည်။

ဤကုဒ်ကို မည်သူနှင့်မျှ မျှဝေမပေးပါနှင့်။
သင့်အကောင့်လုံခြုံရေးအတွက် ဤကုဒ်ကို လျှို့ဝှက်ထားပါ။`
    };
  }

  const isPasswordReset = type === 'password-reset';
  const title = isPasswordReset ? 'Password Reset OTP Code' : 'Account Verification OTP Code';
  const description = isPasswordReset 
    ? 'Please use the following OTP code to reset your password.'
    : 'Please use the following OTP code to verify your account.';
  const usage = isPasswordReset
    ? [
        'Go to the password reset page',
        `Enter the following OTP code: ${otp}`,
        'Enter your new password and click "Reset Password" button'
      ]
    : [
        'Go to your account verification page',
        `Enter the following OTP code: ${otp}`,
        'Click "Verify" button'
      ];

  return {
    subject: isPasswordReset ? 'Password Reset Code - Nan Ayeyar' : 'OTP Code - Nan Ayeyar',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0ea5e9; margin: 0;">🌾 Nan Ayeyar</h1>
          <p style="color: #666; margin: 5px 0;">Premium Rice Trading Platform</p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">${title}</h2>
          <p style="color: #374151; text-align: center; margin-bottom: 20px; font-size: 16px;">
            ${description}
          </p>
          <div style="background-color: #ffffff; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px solid #e5e7eb;">
            <h1 style="color: #0ea5e9; font-size: 36px; margin: 0; letter-spacing: 5px; font-family: monospace;">${otp}</h1>
          </div>
          <p style="color: #374151; text-align: center; margin: 0; font-size: 14px;">
            Use this code to ${isPasswordReset ? 'reset your password' : 'verify your account'}
          </p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px; text-align: center;">
            ⚠️ This code will expire in 10 minutes.
          </p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px;">How to use:</h3>
          <ol style="color: #374151; margin: 0; padding-left: 20px; font-size: 14px;">
            ${usage.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            Do not share this code with anyone.<br>
            Keep this code confidential for your account security.<br>
            If you did not request this email, please ignore it.
          </p>
        </div>
      </div>
    `,
    text: `Nan Ayeyar - ${isPasswordReset ? 'Password Reset' : 'OTP'} Code: ${otp}

${description}

OTP Code: ${otp}

How to use:
${usage.map((step, index) => `${index + 1}. ${step}`).join('\n')}

This code will expire in 10 minutes.

Do not share this code with anyone.
Keep this code confidential for your account security.`
  };
};

# Email Templates

This directory contains email templates for the Nan Ayeyar system, supporting both English and Myanmar (Burmese) languages.

## Template Structure

### OTP Verification Templates
- **Registration**: Sent when user registers for the first time
- **Resend**: Sent when user requests a new OTP code

### Language Support
- **English**: `*-en.html` and `*-en.txt`
- **Myanmar**: `*-my.html` and `*-my.txt`

## Template Variables

All templates support the following placeholders:

- `{{otp}}` - The 6-digit verification code
- `{{siteName}}` - The site name (e.g., "Nan Ayeyar")
- `{{expiryMinutes}}` - OTP expiry time in minutes (e.g., "10")

## Usage Example

```typescript
import fs from 'fs';
import path from 'path';

// Load template
const templatePath = path.join(__dirname, 'otp-verification-en.html');
const template = fs.readFileSync(templatePath, 'utf8');

// Replace variables
const html = template
  .replace(/\{\{otp\}\}/g, '123456')
  .replace(/\{\{siteName\}\}/g, 'Nan Ayeyar')
  .replace(/\{\{expiryMinutes\}\}/g, '10');

// Send email
await sendEmail({
  to: 'user@example.com',
  subject: 'Verify Your Email - Nan Ayeyar',
  html: html,
  text: textVersion // Load corresponding .txt file
});
```

## Template Files

### OTP Verification (Registration)
- `otp-verification-en.html` - English HTML version
- `otp-verification-en.txt` - English plain text version
- `otp-verification-my.html` - Myanmar HTML version
- `otp-verification-my.txt` - Myanmar plain text version

### OTP Resend
- `otp-resend-en.html` - English HTML version
- `otp-resend-en.txt` - English plain text version
- `otp-resend-my.html` - Myanmar HTML version
- `otp-resend-my.txt` - Myanmar plain text version

## Design Features

### HTML Templates
- **Responsive Design**: Mobile-friendly layout
- **Professional Styling**: Clean, modern design with brand colors
- **Accessibility**: Proper contrast ratios and semantic HTML
- **Brand Consistency**: Uses Nan Ayeyar colors and rice emoji (🌾)
- **Security Warnings**: Clear security tips for users

### Plain Text Templates
- **Clean Format**: Easy to read without HTML
- **Essential Information**: All necessary details included
- **Fallback Support**: For email clients that don't support HTML

## Email Subjects

### English
- Registration: "Verify Your Email - Nan Ayeyar"
- Resend: "New Verification Code - Nan Ayeyar"

### Myanmar
- Registration: "အီးမေးလ်အတည်ပြုရန် - Nan Ayeyar"
- Resend: "အတည်ပြုကုဒ်အသစ် - Nan Ayeyar"

## Integration with Backend

These templates are designed to work with the email utility in `src/utils/email.ts`:

```typescript
import { getOTPEmailTemplate } from '../utils/email';

// Get template based on language
const { html, text, subject } = getOTPEmailTemplate(otp, language);

// Send email
await sendEmail({
  to: userEmail,
  subject: subject,
  html: html,
  text: text
});
```

## Customization

To customize the templates:

1. **Colors**: Update CSS variables in the `<style>` section
2. **Branding**: Replace the rice emoji (🌾) with your logo
3. **Content**: Modify the text content while keeping placeholders
4. **Styling**: Adjust the CSS for different visual preferences

## Testing

Test templates with different values:

```typescript
const testData = {
  otp: '123456',
  siteName: 'Nan Ayeyar',
  expiryMinutes: '10'
};
```

## Security Considerations

- **No Sensitive Data**: Templates only contain user-facing information
- **XSS Prevention**: All user data is properly escaped
- **HTTPS Links**: All links use HTTPS protocol
- **No Tracking**: Templates don't include tracking pixels or external resources

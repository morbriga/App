export async function SendEmail({ to, subject, body, isHtml = false }) {
  try {
    console.log('Sending email...');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', body.substring(0, 100) + '...');
    
    // כאן היינו מתחברים לשירות מיילים אמיתי
    // לדוגמה:
    /*
    const response = await fetch('https://api.sendemail.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        to,
        subject,
        body,
        isHtml
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    
    return await response.json();
    */
    
    // בינתיים, מדמים הצלחה
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
export const sendEmailVerificationLink = (nickname, verificationLink) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
          <style>
              /* Global Styles */
              body {
                  font-family: 'Helvetica Neue', Arial, sans-serif;
                  background-color: #f9f9f9;
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  color: #333;
              }
  
              .container {
                  background-color: #ffffff;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                  max-width: 500px;
                  width: 100%;
                  text-align: center;
              }
  
              h2 {
                  font-size: 24px;
                  margin-bottom: 10px;
                  color: #333;
              }
  
              p {
                  font-size: 16px;
                  color: #666;
                  margin-bottom: 20px;
              }
  
              a {
                  display: inline-block;
                  background-color: #007bff;
                  color: #fff;
                  padding: 12px 24px;
                  border-radius: 6px;
                  text-decoration: none;
                  font-weight: bold;
                  font-size: 18px;
                  transition: background-color 0.3s ease;
              }
  
              a:hover {
                  background-color: #0056b3;
              }
  
              .footer {
                  margin-top: 30px;
                  font-size: 12px;
                  color: #999;
              }
  
              .social-icons {
                  display: flex;
                  justify-content: center;
                  margin-top: 15px;
              }
  
              .social-icons a {
                  margin: 0 10px;
                  font-size: 24px;
                  color: #007bff;
                  transition: color 0.3s;
              }
  
              .social-icons a:hover {
                  color: #FCFDFFFF;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Welcome, ${nickname}!</h2>
              <p>We're excited to have you on board. To complete your registration, please verify your email address by clicking the button below:</p>
              <a href="${verificationLink}" target="_blank">Verify Email</a>
              <p>This link will expire in 1 hour. If you didn’t request this, please ignore this email.</p>
              <div class="footer">
                 
                  <div class="social-icons">
                      <a href="https://www.instagram.com" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                      <a href="https://www.facebook.com" target="_blank" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                      <a href="https://www.tiktok.com" target="_blank" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;
};

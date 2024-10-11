// resetPasswordEmailTemplate.js
export const sendLinkResetPasswordTemplate = (resetLink) => {
  return `
  
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <style>
    /* Estilo geral */
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .container {
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
      width: 90%;
      max-width: 500px;
    }

    .logo {
      text-align: center;
      margin-bottom: 20px;
    }

    .logo img {
      max-width: 150px;
      height: auto;
    }

    h2 {
      text-align: center;
      color: #333;
    }

    p {
      text-align: center;
      color: #666;
    }

    a {
      display: block;
      text-align: center;
      background-color: #007bff;
      color: #fff;
      padding: 10px 15px;
      border-radius: 4px;
      text-decoration: none;
      margin: 20px 0;
      font-weight: bold;
    }

    a:hover {
      background-color: #0056b3;
    }

    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: #999;
    }

    .footer h3 {
      margin-top: 10px;
      color: #333;
    }

    .social-icons {
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }

    .social-icons a {
      margin: 0 10px;
      color: #fff; /* Define a cor dos ícones como branco */
      font-size: 24px;
      transition: color 0.3s;
    }

    .social-icons a:hover {
      color: #007bff; /* Cor de hover */
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Logotipo no topo -->
    <div class="logo">
      <img src="https://play-lh.googleusercontent.com/Fro4e_osoDhhrjgiZ_Y2C5FNXBMWvrb4rGpmkM1PDAcUPXeiAlPCq7NeaT4Q6NRUxRqo" alt="Logo" />
    </div>

    <h2>Reset Your Password</h2>
    <p>
      It happens to the best of us! Click the link below to reset your
      password and regain access to your account:
    </p>

    <a href="${resetLink}" target="_blank">Reset Password</a>

    <div class="footer">
      <p>This link is valid for 10 minutes.</p>
      <h3>Follow us</h3>

      <!-- Ícones das redes sociais -->
      <div class="social-icons">
        <a href="https://www.instagram.com/seuperfil" target="_blank">
          <i class="fab fa-instagram"></i> <!-- Ícone do Instagram -->
        </a>
        <a href="https://www.facebook.com/seuperfil" target="_blank">
          <i class="fab fa-facebook"></i> <!-- Ícone do Facebook -->
        </a>
        <a href="https://www.tiktok.com/@seuperfil" target="_blank">
          <i class="fab fa-tiktok"></i> <!-- Ícone do TikTok -->
        </a>
      </div>
    </div>
  </div>
</body>
</html>



  `;
};

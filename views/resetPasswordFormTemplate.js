export const resetPasswordFormTemplate = (token) => {
  return `
     <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Reset</title>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          />
          <style>
            body {
              font-family: "Arial", sans-serif;
              background-image: url("https://example.com/background-image.jpg");
              background-size: cover;
              background-position: center;
              color: #022011ff;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              background-color: #022011ff;
              border-radius: 10px;
              box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
              text-align: center;
            }
            h1 {
              color: rgba(167, 240, 240, 1);
              font-size: 24px;
            }
            label {
              font-size: 18px;
              color: #a7f0f0;
              margin-top: 20px;
              display: block;
            }
            input[type="password"] {
              width: 80%;
              padding: 10px;
              margin-top: 10px;
              border: none;
              border-radius: 5px;
              background-color: rgba(255, 255, 255, 0.8);
            }
            button {
              padding: 15px 30px;
              background-color: #c922f3;
              color: #fff;
              border: none;
              border-radius: 25px;
              transition: background-color 0.3s ease;
              font-size: 18px;
              margin-top: 20px;
              cursor: pointer;
            }
            button:hover {
              background-color: #f9e4daff;
            }
            #reset-message {
              margin-top: 20px;
              color: rgba(167, 240, 240, 1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Password Reset</h1>
            <div id="reset-form">
              <form onsubmit="resetPassword(event)">
                <label for="newPassword">New Password:</label>
                <input type="password" id="newPassword" name="newPassword" required />
  
                <label for="repeatPassword">Repeat Password:</label>
                <input type="password" id="repeatPassword" name="repeatPassword" required />
  
                <input type="hidden" id="token" name="token" value="${token}" />
                <button type="submit">Reset Password</button>
              </form>
  
              <p id="reset-message"></p>
            </div>
          </div>
      
      <script>
  function resetPassword(event) {
    event.preventDefault();

    var newPassword = document.getElementById("newPassword").value;
    var repeatPassword = document.getElementById("repeatPassword").value;
    var token = document.getElementById("token").value; // Captura o token corretamente

    // Verifica se as senhas coincidem
    if (newPassword !== repeatPassword) {
      document.getElementById("reset-message").innerText =
        "The passwords do not match. Please try again.";
      return;
    }

    // Verifica o tamanho mínimo da senha
    if (newPassword.length < 7) {
      document.getElementById("reset-message").innerText =
        "Password must be at least 7 characters long.";
      return;
    }

    // Verifica se o token está presente
    if (!token) {
      document.getElementById("reset-message").innerText =
        "Token is missing. Please check your link.";
      return;
    }

    var xhr = new XMLHttpRequest();
    // A URL já inclui o token
    xhr.open(
      "POST",
      "http://localhost:3000/api/v1/auth/reset-password/" + encodeURIComponent(token),
      true
    );

    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          document.getElementById("reset-message").innerText = "Password has been reset successfully!";
        } else {
          console.error(xhr.responseText); // Exibir a resposta de erro no console
          
          // Tente analisar a resposta JSON
          try {
            var response = JSON.parse(xhr.responseText); // Converte a resposta para objeto
            document.getElementById("reset-message").innerText = response.error; // Mostra a mensagem de erro
          } catch (e) {
            // Se a análise falhar, mostra uma mensagem genérica
            document.getElementById("reset-message").innerText = "Error resetting password. Please try again later.";
          }
        }
      }
    };

    // Envia apenas newPassword no corpo da requisição
    var data = "newPassword=" + encodeURIComponent(newPassword);
    xhr.send(data);
  }
</script>



        </body>
      </html>
     `;
};

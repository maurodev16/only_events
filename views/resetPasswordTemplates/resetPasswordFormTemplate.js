export const resetPasswordFormTemplate = (token) => {
  // Garante que o token está presente
  if (!token) {
    throw new Error("Token is required for password reset.");
  }

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
            #loading {
              display: none; /* Escondido por padrão */
              margin-top: 20px;
              font-size: 16px;
              color: #fff;
            }

            /* Estilos do Modal */
            .modal {
              display: none; /* Ocultado por padrão */
              position: fixed;
              z-index: 1000;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              overflow: auto;
              background-color: rgba(0, 0, 0, 0.7);
              padding-top: 60px;
            }
            .modal-content {
              background-color: #fefefe;
              margin: 5% auto;
              padding: 20px;
              border: 1px solid #888;
              width: 80%;
              max-width: 500px;
              border-radius: 10px;
              text-align: center;
            }
            .close {
              color: #aaa;
              float: right;
              font-size: 28px;
              font-weight: bold;
            }
            .close:hover,
            .close:focus {
              color: black;
              text-decoration: none;
              cursor: pointer;
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

              <p id="loading">Loading, please wait...</p> <!-- Elemento de loading -->
            </div>
          </div>

          <!-- Modal -->
          <div id="resetModal" class="modal">
            <div class="modal-content">
              <span class="close" onclick="closeModal()">&times;</span>
              <p id="reset-message"></p>
              <p id="modal-instruction" style="margin-top: 10px;"></p>
            </div>
          </div>

          <script>
            const isDev = window.location.hostname === "localhost";
            const API_BASE_URL = isDev ? "http://localhost:3000" : "${process.env.API_URL}"; // URL da produção

            function resetPassword(event) {
              event.preventDefault();
              const newPassword = document.getElementById("newPassword").value;
              const repeatPassword = document.getElementById("repeatPassword").value;
              const token = document.getElementById("token").value;

              // Exibe o loading
              document.getElementById("loading").style.display = "block";

              // Verifica se as senhas coincidem
              if (newPassword !== repeatPassword) {
                showModal("The passwords do not match. Please try again.");
                document.getElementById("loading").style.display = "none"; // Esconde o loading
                return;
              }

              // Verifica o tamanho mínimo da senha
              if (newPassword.length < 7) {
                showModal("Password must be at least 7 characters long.");
                document.getElementById("loading").style.display = "none"; // Esconde o loading
                return;
              }

              // Cria um novo objeto XMLHttpRequest para a requisição
              var xhr = new XMLHttpRequest();
              xhr.open("POST", \`\${API_BASE_URL}/api/v1/auth/reset-password/\${encodeURIComponent(token)}\`, true);
              xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

              xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                  document.getElementById("loading").style.display = "none"; // Esconde o loading
                  if (xhr.status === 200) {
                    // Fecha o formulário antes de mostrar o modal
                    document.getElementById("reset-form").style.display = "none";
                    showModal("Password has been reset successfully!", "Please return to the app and enter your new password. You can close this modal.");
                  } else {
                    console.error(xhr.responseText); // Exibe a resposta de erro no console
                    try {
                      const response = JSON.parse(xhr.responseText);
                      showModal(response.error || "Error resetting password. Please try again later.");
                    } catch (e) {
                      showModal("Error resetting password. Please try again later.");
                    }
                  }
                }
              };

              // Envia apenas newPassword no corpo da requisição
              const data = "newPassword=" + encodeURIComponent(newPassword);
              xhr.send(data);
            }

            function showModal(message, instruction = "") {
              document.getElementById("reset-message").innerText = message;
              document.getElementById("modal-instruction").innerText = instruction;
              document.getElementById("resetModal").style.display = "block"; // Exibe o modal
            }

            function closeModal() {
              document.getElementById("resetModal").style.display = "none"; // Fecha o modal
            }

            // Fecha o modal se o usuário clicar fora dele
            window.onclick = function(event) {
              const modal = document.getElementById("resetModal");
              if (event.target === modal) {
                closeModal();
              }
            };
          </script>
        </body>
      </html>
  `;
};

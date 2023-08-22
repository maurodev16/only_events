/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: APIs relacionadas à autenticação
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Registrar um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Erro de validação
 */

// Aqui você pode adicionar mais documentação para outros endpoints

export const errorHandler = (err, req, res, next) => {
  // Se o status code já foi definido, use-o. Senão, padrão é 500 (Erro Interno do Servidor).
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message,
    // Em produção, não queremos expor o stack trace do erro.
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
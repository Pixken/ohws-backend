export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'your-secret-key-here',
  expiresIn: '24h'
}; 
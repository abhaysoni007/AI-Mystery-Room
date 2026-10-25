import app from './app.js';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';

async function bootstrap() {
  try {
    await connectDb();
    app.listen(env.PORT, () => {
      console.log(`Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

bootstrap();

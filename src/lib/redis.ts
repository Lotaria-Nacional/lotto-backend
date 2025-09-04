import Redis from 'ioredis';
import env from '../constants/env';
// 172.17.198.67
// host: "172.17.198.67",
// password: "msftsrep0."

const redis = new Redis(env.REDIS_URL);

redis.on('ready', async () => {
  console.log('✅ Conectado ao Redis com sucesso!');
});

redis.on('error', err => {
  console.error('❌ Erro ao conectar ao Redis:', err);
});

export default redis;

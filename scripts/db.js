const { Client } = require('pg');
const client = new Client({
  host: 'database-1.cnswse8qowmn.eu-north-1.rds.amazonaws.com',
  user: 'postgres',
  password: 'Chas-grupp-3',
  database: 'Chas_group_3',
  port: 5432,
  ssl: {
    rejectUnauthorized: false, // Endast för teständamål, överväg att hantera certifikat på rätt sätt för produktion
  },
});
client
  .connect()
  .then(() => console.log('Connected successfully'))
  .catch((e) => console.log('Connection error:', e))
  .finally(() => client.end());
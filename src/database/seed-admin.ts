import { DataSource, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entity/user.entity';

export async function seedAdmin(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@local.com';
  const adminPassword = process.env.ADMIN_PASSWORD || '123456';
  const adminName = process.env.ADMIN_NAME || 'Admin';

  const exists = await userRepo.findOne({
    where: {
      email: adminEmail
    },
  });
  const rows = await dataSource.query('SELECT * FROM users');
  // console.log(rows);

  // console.log(userRepo.metadata.tableName);
  // console.log('rows:', rows);
  // console.log('adminEmail:', JSON.stringify(adminEmail));
  // console.log(exists, 'this is exists');
  // console.log({
  //   database: dataSource.options.database,
  // });

  if (!exists) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await userRepo.save({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      employee_code: '1',
    });
  }

  console.log('Seed admin done');
}
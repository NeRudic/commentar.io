import { Module } from '@nestjs/common';
import { DB } from './db.service';
import { initSQL } from './db.config';

@Module({
  providers: [
    {
      provide: DB,
      useFactory: async () => {
        const db = new DB();
        await db.connect('db.sqlite');
        await db.exec(initSQL);
        return db;
      },
    },
  ],
  exports: [DB],
})
export class DBModule {}

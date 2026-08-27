import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './tasks/task.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '12345678',
      database: 'nestjs_task_management',
      autoLoadEntities: true,
      synchronize: true,
      entities: [Task],
    }),
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

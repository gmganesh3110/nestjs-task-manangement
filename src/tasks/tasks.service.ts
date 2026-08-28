import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks.dto';
import { UpdateTaskStatus } from './dto/update-task.dto';
import { Task } from './task.entity';
import { TaskStatus } from './dto/task-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: TaskStatus.OPEN,
    });
    return await this.taskRepository.save(task);
  }

  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { search, status } = filterDto;

    const where: FindOptionsWhere<Task>[] = [];
    if (search) {
      where.push(
        { title: ILike(`%${search}%`), ...(status && { status }) },
        { description: ILike(`%${search}%`), ...(status && { status }) },
      );
    } else if (status) {
      where.push({ status });
    }

    return this.taskRepository.find({ where });
  }
  async getTaskById(id: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} is not found`);
    }
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const found = await this.getTaskById(id);
    await this.taskRepository.delete(found.id);
  }

  async updateTaskStatus(
    id: string,
    updateTaskStatus: UpdateTaskStatus,
  ): Promise<Task> {
    const task = await this.getTaskById(id);
    await this.taskRepository.update(
      { id: task.id },
      { status: updateTaskStatus.status },
    );
    return await this.getTaskById(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStatus } from './dto/task.model';
import { v4 as uuid } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks.dto';
import { UpdateTaskStatus } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  constructor() {}

  getTasks(filterDto: GetTasksFilterDto): Task[] {
    if (Object.keys(filterDto).length) {
      return this.getTaskWithFilters(filterDto);
    } else {
      return this.getAllTasks();
    }
  }

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTaskWithFilters(filterDto?: GetTasksFilterDto): Task[] {
    const { status, search } = filterDto || {};
    let tasks = this.getAllTasks();
    if (status) {
      tasks = tasks.filter((task) => task.status === status);
    }
    if (search) {
      tasks = tasks.filter((task) => {
        if (
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description.toLowerCase().includes(search.toLowerCase())
        ) {
          return true;
        }
        return false;
      });
    }
    return tasks;
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;
    const task: Task = {
      id: uuid(),
      title: title,
      description: description,
      status: TaskStatus.OPEN,
    };
    this.tasks.push(task);
    return task;
  }

  getTaskById(id: string): Task {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  deleteTask(id: string): void {
    const found = this.getTaskById(id);
    this.tasks = this.tasks.filter((task) => task.id !== found.id);
  }

  updateTaskStatus(id: string, updateTaskStatus: UpdateTaskStatus): Task {
    const task = this.getTaskById(id);
    task.status = updateTaskStatus.status;
    return task;
  }
}

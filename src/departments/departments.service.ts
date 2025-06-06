import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Department } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Department[]> {
    return this.prisma.department.findMany();
  }

  async findOne(id: number): Promise<Department | null> {
    return this.prisma.department.findUnique({
      where: { id },
    });
  }

  async create(data: {
    name: string;
    description?: string;
  }): Promise<Department> {
    return this.prisma.department.create({
      data,
    });
  }

  async update(id: number, data: {
    name?: string;
    description?: string;
  }): Promise<Department> {
    return this.prisma.department.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Department> {
    return this.prisma.department.delete({
      where: { id },
    });
  }
}

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Department, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<Department[]> {
    try {
      return await this.prisma.department.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      throw new Error('Error al obtener la lista de departamentos');
    }
  }

  async findOne(id: number): Promise<Department> {
    if (isNaN(id)) {
      throw new BadRequestException('ID de departamento no válido');
    }

    try {
      const department = await this.prisma.department.findUnique({
        where: { id },
      });

      if (!department) {
        throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
      }

      return department;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error('Error al obtener el departamento');
    }
  }

  async create(data: {
    name: string;
  }): Promise<Department> {
    try {
      return await this.prisma.department.create({
        data,
      });
    } catch (error) {
      console.log(error)
      if (error instanceof ConflictException) throw error;
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException('Ya existe un departamento con el mismo nombre');
      }
      throw new Error('Error al crear el departamento');
    }
  }

  async update(id: number, data: {
    name?: string;
  }): Promise<Department> {
    try {
      const departmentUpdated = await this.prisma.department.update({
        where: { id },
        data,
      });
      return departmentUpdated;
    } catch (error) {
      console.log(error)
      if (error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Error al actualizar el departamento');
    }
  }

  async remove(id: number): Promise<Department> {
    if (isNaN(id)) {
      throw new BadRequestException('ID de departamento no válido');
    }

    try {
      // Check if department exists
      await this.findOne(id);

      // Check if department has employees
      const hasEmployees = await this.prisma.employee.count({
        where: { departmentId: id },
      }) > 0;

      if (hasEmployees) {
        throw new ConflictException('No se puede eliminar el departamento porque tiene empleados asignados');
      }

      return await this.prisma.department.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Error al eliminar el departamento');
    }
  }
}

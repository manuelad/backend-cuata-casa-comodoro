import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Employee } from '@prisma/client';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { firstLastMonthDays } from 'src/lib/utils';

@Injectable()
export class EmployeesService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateEmployeeDto): Promise<Employee & { remainingBalance: number }> {
        try {
            const employee = await this.prisma.employee.create({
                data,
                include: {
                    department: true,
                    transactions: true
                },
            });
            return {
                ...employee,
                remainingBalance: data.monthlyBudget
            }
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002')
                    throw new BadRequestException('Ya existe un usuario con una cuenta casa o con identificación con el mismo codigo')
            }
            throw new BadRequestException('Ha ocurrido un error, intentelo mas tarde')
        }
    }


    async findAll(): Promise<Array<Employee & { remainingBalance: number }>> {
        try {
            const employees = await this.prisma.employee.findMany({
                include: {
                    department: true,
                    transactions: true,
                },
            });
            return Promise.all(employees.map(async emp => ({
                ...emp,
                ...(await this.remainingBalance(emp.id))
            })));
            // return employees
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }

    async findOne(id: number): Promise<Employee> {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                department: true,
                transactions: true,
            },
        });

        if (!employee) {
            throw new NotFoundException(`Employee with id ${id} not found`);
        }

        return employee
    }

    async findByUid(uid: string): Promise<Employee> {
        const employee = await this.prisma.employee.findUnique({
            where: { uid },
            include: {
                department: true,
                transactions: true,
            },
        });

        if (!employee) {
            throw new Error(`Employee with uid ${uid} not found`);
        }

        return employee;
    }

    async update(
        id: number,
        data: UpdateEmployeeDto
    ): Promise<Employee> {
        return this.prisma.employee.update({
            where: { id },
            data,
            include: {
                department: true,
                transactions: true,
            },
        });
    }

    async remove(id: number): Promise<Employee> {
        return this.prisma.employee.delete({
            where: { id },
        });
    }

    async remainingBalance(id: number): Promise<{ remainingBalance: number }> {
        const [firstDay, lastDay] = firstLastMonthDays()
        try {
            const amountProductsConsumed = await this.prisma.productTransaction.findMany({
                where: {
                    transaction: {
                        employeeId: id
                    },
                    createdAt: {
                        gte: firstDay,
                        lte: lastDay
                    }
                },
                include: {
                    product: true,
                },
            })

            const employee = await this.findOne(id)
            if (!employee) throw new NotFoundException('Employee not found')

            const TotalAmountProductsConsumed = Number(amountProductsConsumed.reduce((acc, curr) => acc + (curr.count * curr.product.price), 0).toFixed(2))
            const remainingBalance = employee.monthlyBudget - TotalAmountProductsConsumed
            return {
                remainingBalance
            }
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }
}

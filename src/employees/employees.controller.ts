import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete, ValidationPipe,
    UsePipes,
    ParseIntPipe
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Post()
    @Roles(Role.ADMIN)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    create(@Body(ValidationPipe) createEmployeeDto: CreateEmployeeDto) {
        return this.employeesService.create(createEmployeeDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.CASHIER)
    findAll() {
        return this.employeesService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.CASHIER)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.employeesService.findOne(id);
    }

    @Get('uid/:uid')
    @Roles(Role.ADMIN, Role.CASHIER)
    findByUid(@Param('uid') uid: string) {
        return this.employeesService.findByUid(uid);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    @UsePipes(new ValidationPipe(), ParseIntPipe)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updateEmployeeDto: UpdateEmployeeDto,
    ) {
        return this.employeesService.update(id, updateEmployeeDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.employeesService.remove(id);
    }

    @Get('balance/:id')
    @Roles(Role.ADMIN, Role.CASHIER)
    remainingBalance(@Param('id', ParseIntPipe) id: number) {
        return this.employeesService.remainingBalance(id);
    }
}
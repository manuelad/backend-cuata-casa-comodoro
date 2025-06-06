import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ValidationPipe,
    UsePipes,
    ParseIntPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    @Roles(Role.ADMIN, Role.CASHIER)
    @UsePipes(new ValidationPipe())
    create(@Body() createTransactionDto: CreateTransactionDto) {
        return this.transactionsService.create(createTransactionDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.CASHIER)
    findAll() {
        return this.transactionsService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.CASHIER)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.transactionsService.findOne(id);
    }

    @Get('employee/:employeeId')
    @Roles(Role.ADMIN, Role.CASHIER)
    findByEmployeeId(@Param('employeeId', ParseIntPipe) employeeId: number) {
        return this.transactionsService.findByEmployeeId(employeeId);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTransactionDto: Partial<Transaction>,
    ) {
        return this.transactionsService.update(id, updateTransactionDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.transactionsService.remove(id);
    }

    @Post(':id/cancel')
    @Roles(Role.ADMIN, Role.CASHIER)
    cancel(@Param('id', ParseIntPipe) id: number) {
        return this.transactionsService.cancel(id);
    }
}
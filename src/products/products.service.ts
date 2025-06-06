import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateProductDto): Promise<Product> {
        return this.prisma.product.create({
            data,
        });
    }

    async findAll(): Promise<Product[]> {
        return this.prisma.product.findMany({
            include: {
                transactions: true,
            },
        });
    }

    async findOne(id: number): Promise<Product | null> {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                transactions: true,
            },
        });
    }

    async update(id: number, data: UpdateProductDto): Promise<Product> {
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<Product> {
        return this.prisma.product.delete({
            where: { id },
        });
    }
}
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { firstLastMonthDays } from 'src/lib/utils';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateTransactionDto): Promise<Transaction & { AmountConsumed: number , remainingBalance: number}> {
        const [firstDay, lastDay] = firstLastMonthDays()  

        const employee = await this.prisma.employee.findUnique({
            where: {
                id: data.employeeId
            },
        })
        if (!employee) throw new NotFoundException('Employee not found')

        const productsConsumed = await this.prisma.productTransaction.findMany({
            where: {
                transaction: {
                    employeeId: data.employeeId
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

        const TotalConsumed = Number(productsConsumed.reduce((acc, curr) => acc + (curr.count * curr.product.price), 0).toFixed(2))
        let amountTrasaction = 0
        for (const item of data.productTransactions) {
            const productPrice = await this.prisma.product.findUnique({
                where: {
                    id: item.productId
                },
                select: {
                    price: true
                }
            })
            if (!productPrice) throw new NotFoundException('Product not found')
            amountTrasaction += Number((productPrice.price * item.count).toFixed(2))
        }

        if (TotalConsumed + amountTrasaction > employee.monthlyBudget)
            throw new BadRequestException(`La tranzaccion no se puede realizar porque sobrepasa la cuenta casa del empleado`)


        const transaction = await this.prisma.transaction.create({
            data: {
                employeeId: data.employeeId,
                products: {
                    create: data.productTransactions
                }
            },
            include: {
                employee: true,
                products: {
                    include:{
                        product: true
                    }
                }
            }
        })

        return {
            ...transaction,
            AmountConsumed: TotalConsumed + amountTrasaction,
            remainingBalance: employee.monthlyBudget - (TotalConsumed + amountTrasaction)
        }
    }

    async findAll(): Promise<Transaction[]> {
        return this.prisma.transaction.findMany({
            include: {
                employee: true,
                products: {
                    include: {
                        product: true
                    }
                }
            },
        });
    }

    async findOne(id: number): Promise<Transaction | null> {
        return this.prisma.transaction.findUnique({
            where: { id },
            include: {
                employee: true,
                products: {
                    include: {
                        product: true
                    }
                }
            },
        });
    }

    async findByEmployeeId(employeeId: number): Promise<Transaction[]> {
        const [firstDay, lastDay] = firstLastMonthDays()  
        return this.prisma.transaction.findMany({
            where: { employeeId ,
                createdAt: {
                    gte: firstDay,
                    lte: lastDay
                }
            },
            include: {
                employee: true,
                products: {
                    include: {
                        product: true
                    }
                }
            },
        });
    }

    async update(
        id: number,
        data: {
            employeeId?: number;
            productTransactions?: {
                productId: number;
                count: number;
            }[];
        },
    ): Promise<Transaction> {
        return this.prisma.transaction.update({
            where: { id },
            data: {
                employeeId: data.employeeId,
                products: data.productTransactions ? {
                    deleteMany: {},
                    create: data.productTransactions
                } : undefined
            },
            include: {
                employee: true,
                products: {
                    include: {
                        product: true
                    }
                }
            },
        });
    }

    async remove(id: number): Promise<Transaction> {
      try {
        const [transaction, _] = await this.prisma.$transaction([
            this.prisma.transaction.delete({
                where: { id },
                include: {
                    employee: true,
                    products: {
                        include: {
                            product: true
                        }
                    }
                },
            }),
            this.prisma.productTransaction.deleteMany({
                where: { transactionId: id }
            })
        ])
        return transaction
      } catch (error) {
        throw error
      }
    }

    async cancel(id: number): Promise<Transaction & { amount: number }> {
      try {
          return this.prisma.$transaction(async (prismaTx) => {
              const transaction = await prismaTx.transaction.findUnique({
                  where: { id },
                  include: {
                      products: true
                  }
              });
  
              if (!transaction) {
                  throw new NotFoundException('Transaction not found');
              }
  
              // Delete all product transactions associated with this transaction
              await prismaTx.productTransaction.deleteMany({
                  where: { transactionId: id }
              });
  
              // Delete the transaction itself
              const cancelTransaction = await prismaTx.transaction.delete({
                  where: { id },
                  include: {
                      employee: true,
                      products: {
                          include: {
                              product: true
                          }
                      }
                  }
              });
              const amount = cancelTransaction.products.reduce((acc, curr) => acc + (curr.count * curr.product.price), 0);
              return {
                  ...cancelTransaction,
                  amount
              }
          });
      } catch (error) {
        throw error
      }
    }
}
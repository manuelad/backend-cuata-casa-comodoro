import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    };
  }

  async login(user: LoginDto) {
    const payload = await this.validateUser(user.username, user.password);
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async register(userDto: RegisterDto) {
    console.log('userDto:',userDto)
    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          username: userDto.username,
          password: hashedPassword,
          name: userDto.name,
          role: userDto.role,
        },
      });

      return {
        id: user.id,
        username: user.username,
        role: user.role,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Ya existe un usuario con el mismo nombre de usuario');
        }
      }
      throw new BadRequestException('Ha ocurrido un error, intentelo mas tarde')
    }
  }
}

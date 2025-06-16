import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
// {
//   constructor(
//     private readonly jwtService: JwtService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();

//     try {
//       const token = this.extractTokenFromHeader(request);
//       if (!token) {
//         return false;
//       }
//       const payload = await this.jwtService.verifyAsync(token);
//       request['user'] = payload;
//       return false;
//     } catch {
//       return false;
//     }
//   }

//   private extractTokenFromHeader(request: Request): string | undefined {
//     const authHeader = request.headers.authorization;
//     if (authHeader) {
//       const [type, token] = authHeader.split(' ');
//       if (type === 'Bearer' && token) {
//         return token;
//       }
//     }
//     return undefined;
//   }
// }

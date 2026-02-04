import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/common/guard/optional-jwt-auth.guard';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
  providers: [OptionalJwtAuthGuard, JwtAuthGuard],
  exports: [JwtModule],
})
export class AuthModule {}

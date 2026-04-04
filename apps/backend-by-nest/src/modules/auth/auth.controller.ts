import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import type { AuthRequest } from '@/common/interface/auth-request.interface';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@/common/interface/jwt-payload.interface';
import { RefreshToken } from './auth.constant';
import { JwtAuthGuard } from '@/common/guard/jwt-auth.guard';
import { LoginProhibitGuard } from '@/common/guard/login-prohibit.guard';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('check-login-prohibit')
  @UseGuards(JwtAuthGuard, LoginProhibitGuard)
  checkIsLoginProhibit() {
    return;
  }

  @Post('refresh-user')
  async refreshUser(@Req() req: AuthRequest, @Res() res: Response) {
    const refreshToken = req.cookies.userRefreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: 'No token', error: 'Unauthorized', statusCode: 401 });
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.REFRESH_SECRET,
      });

      const storedToken = await this.authService.get(payload.id, 'user');

      if (storedToken !== refreshToken) {
        return res.status(401).json({
          message: 'Token mismatch',
          error: 'Unauthorized',
          statusCode: 401,
        });
      }

      await this.authService.remove(payload.id, 'user');

      const newAccessToken = this.authService.generateAccessToken(
        payload.id,
        'user',
      );

      const newRefreshToken = await this.authService.generateRefreshToken(
        payload.id,
        'user',
      );

      res.cookie(RefreshToken.user, newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.json({
        code: 0,
        message: 'success',
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch {
      return res.status(401).json({
        message: '登录状态过期，请重新登录',
        error: 'Unauthorized',
        statusCode: 401,
      });
    }
  }

  @Post('refresh-admin')
  async refreshAdmin(@Req() req: AuthRequest, @Res() res: Response) {
    const refreshToken = req.cookies.adminRefreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: 'No token', error: 'Unauthorized', statusCode: 401 });
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.REFRESH_SECRET,
      });

      const storedToken = await this.authService.get(payload.id, 'admin');

      if (storedToken !== refreshToken) {
        return res.status(401).json({
          message: 'Token mismatch',
          error: 'Unauthorized',
          statusCode: 401,
        });
      }

      await this.authService.remove(payload.id, 'admin');

      const newAccessToken = this.authService.generateAccessToken(
        payload.id,
        'admin',
      );

      const newRefreshToken = await this.authService.generateRefreshToken(
        payload.id,
        'admin',
      );

      res.cookie(RefreshToken.admin, newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.json({
        code: 0,
        message: 'success',
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch {
      return res.status(401).json({
        message: '登录状态过期，请重新登录',
        error: 'Unauthorized',
        statusCode: 401,
      });
    }
  }
}

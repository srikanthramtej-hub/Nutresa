import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  getProfile(@Req() req: any) {
    return this.users.getProfile(req.user.id)
  }

  @Put('me')
  updateProfile(@Req() req: any, @Body() body: { name?: string; phone?: string }) {
    return this.users.updateProfile(req.user.id, body)
  }

  @Post('addresses')
  addAddress(@Req() req: any, @Body() body: any) {
    return this.users.addAddress(req.user.id, body)
  }

  @Delete('addresses/:id')
  deleteAddress(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.users.deleteAddress(req.user.id, id)
  }
}

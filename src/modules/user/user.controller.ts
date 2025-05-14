import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/common/decorator/custom.decorator';

@Controller('identity')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.userService.findUsers();
  }

  @Get('captcha')
  @Public()
  getCaptcha() {
    return this.userService.getCaptcha();
  }

  @Post('validate-captcha')
  @Public()
  validateCaptcha(@Body() data: { uuid: string; code: string }) {
    const isValid = this.userService.validateCaptcha(data.uuid, data.code);
    return { success: isValid };
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}

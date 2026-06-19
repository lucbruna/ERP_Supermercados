import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/permission.decorator';
import { CurrentUser, ICurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequirePermission('users', 'CRIAR')
  @ApiOperation({ summary: 'Criar novo usuário' })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  @RequirePermission('users', 'LER')
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'perfil', required: false })
  @ApiQuery({ name: 'departamento', required: false })
  async findAll(
    @CurrentUser() user: ICurrentUser,
    @Query() query: { page?: number; limit?: number; perfil?: string; departamento?: string },
  ) {
    return this.userService.findAll(user.companyId, query);
  }

  @Get(':id')
  @RequirePermission('users', 'LER')
  @ApiOperation({ summary: 'Obter usuário por ID' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('users', 'ATUALIZAR')
  @ApiOperation({ summary: 'Atualizar usuário' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.userService.update(id, data);
  }

  @Patch(':id/toggle-status')
  @RequirePermission('users', 'ATUALIZAR')
  @ApiOperation({ summary: 'Ativar/Desativar usuário' })
  async toggleStatus(@Param('id') id: string) {
    return this.userService.toggleStatus(id);
  }

  @Delete(':id')
  @RequirePermission('users', 'EXCLUIR')
  @ApiOperation({ summary: 'Remover usuário' })
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}

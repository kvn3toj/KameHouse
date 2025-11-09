import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CompleteHabitDto } from './dto/complete-habit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: any, @Body() createHabitDto: CreateHabitDto) {
    return this.habitsService.create(user.id, createHabitDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.habitsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.habitsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
  ) {
    return this.habitsService.update(id, user.id, updateHabitDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.habitsService.remove(id, user.id);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  complete(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() completeHabitDto: CompleteHabitDto,
  ) {
    return this.habitsService.complete(id, user.id, completeHabitDto);
  }

  @Delete(':id/complete')
  @HttpCode(HttpStatus.OK)
  uncomplete(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('date') date?: string,
  ) {
    return this.habitsService.uncomplete(id, user.id, date);
  }
}

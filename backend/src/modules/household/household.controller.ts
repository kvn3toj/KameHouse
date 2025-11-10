import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HouseholdService } from './household.service';
import {
  CreateHouseholdDto,
  UpdateHouseholdDto,
  JoinHouseholdDto,
  UpdateMemberDto,
  HouseholdResponse,
  LeaderboardEntry,
} from './dto/household.dto';

@Controller('household')
@UseGuards(JwtAuthGuard)
export class HouseholdController {
  constructor(private householdService: HouseholdService) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() dto: CreateHouseholdDto,
  ): Promise<HouseholdResponse> {
    return this.householdService.create(req.user.id, dto);
  }

  @Post('join')
  async join(
    @Req() req: any,
    @Body() dto: JoinHouseholdDto,
  ): Promise<HouseholdResponse> {
    return this.householdService.join(req.user.id, dto);
  }

  @Get('my')
  async getMyHousehold(@Req() req: any): Promise<HouseholdResponse | null> {
    return this.householdService.getUserHousehold(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HouseholdResponse> {
    return this.householdService.findOne(id);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateHouseholdDto,
  ): Promise<HouseholdResponse> {
    return this.householdService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string): Promise<void> {
    return this.householdService.delete(req.user.id, id);
  }

  @Post(':id/leave')
  async leave(@Req() req: any, @Param('id') id: string): Promise<void> {
    return this.householdService.leave(req.user.id, id);
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Req() req: any,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ): Promise<void> {
    return this.householdService.removeMember(req.user.id, id, memberId);
  }

  @Put(':id/members/:memberId')
  async updateMember(
    @Req() req: any,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.householdService.updateMember(req.user.id, id, memberId, dto);
  }

  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id') id: string): Promise<LeaderboardEntry[]> {
    return this.householdService.getLeaderboard(id);
  }
}

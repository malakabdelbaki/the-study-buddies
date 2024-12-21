import { Controller, Get, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { LogsService } from './log.service'; // Import the service
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';

@Controller('logs')  // Define the route for logs
@UseGuards(AuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  // Endpoint to retrieve logs based on optional query parameters
  @Roles(Role.Admin)
  @UseGuards(authorizationGuard)
  @Get()
  async getLogs(
    @Query('limit') limit: string,  // Accept limit as a query param
    @Query('level') level: string,  // Accept log level (info, error, etc.)
  ): Promise<any[]> {
    try {
      const query: any = {};  // Initialize an empty query object

      // If a level is provided, filter by level
      if (level) {
        query['level'] = level;
      }

      // Default limit to 50 if not provided
      const logLimit = limit ? parseInt(limit, 10) : 50;

      // Call the service to fetch logs with the query and limit
      const logs = await this.logsService.getLogs(query, logLimit);

      return logs;  // Return logs to the client
    } catch (error) {
      // If an error occurs, throw an HttpException
      throw new HttpException('Error fetching logs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

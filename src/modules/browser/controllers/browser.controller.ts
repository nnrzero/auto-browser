import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ACTION_DESCRIPTIONS, EBrowserActionType } from '../interfaces/browser.interface';
import { BrowserActionService } from '../services/browser-action.service';
import { BrowserService } from '../services/browser.service';
import { ActionDto, BrowserActionDto } from './browser.dto';

// Schema classes để hiển thị rõ ràng trong Swagger
class PageInfoSchema {
  @ApiProperty({ example: 'AB12CD34EF56' })
  pageId: string;

  @ApiProperty({ example: 'https://google.com' })
  url: string;

  @ApiProperty({ example: 'Google' })
  title: string;

  @ApiProperty({ example: false })
  isClosed: boolean;
}

class GetPagesResponseSchema {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [PageInfoSchema] })
  pages: PageInfoSchema[];

  @ApiProperty({ example: null, nullable: true })
  error?: string;
}

class ActionResultSchema {
  @ApiProperty({
    enum: EBrowserActionType,
    example: EBrowserActionType.CLICK,
    description: 'Loại hành động đã thực hiện'
  })
  type: EBrowserActionType;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    example: { text: 'Nội dung element', url: 'https://example.com' },
    nullable: true,
    description: 'Dữ liệu trả về từ hành động (tùy thuộc vào loại hành động)'
  })
  data?: any;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Thông báo lỗi nếu hành động thất bại'
  })
  error?: string;
}

class ExecuteActionsResponseSchema {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [ActionResultSchema] })
  results: ActionResultSchema[];

  @ApiProperty({ example: 'AB12CD34EF56' })
  pageId: string;
}

class ClosePageResponseSchema {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: null, nullable: true })
  error?: string;
}

@ApiTags('Browser')
@ApiExtraModels(
  ActionDto,
  PageInfoSchema,
  GetPagesResponseSchema,
  ActionResultSchema,
  ExecuteActionsResponseSchema,
  ClosePageResponseSchema
)
@Controller('browser')
export class BrowserController {
  constructor(
    private readonly browserService: BrowserService,
    private readonly browserActionService: BrowserActionService
  ) {}

  @Get('setting-profile')
  @ApiOperation({
    summary: 'Khởi động trình duyệt',
    description: 'Khởi động trình duyệt với profile ID cụ thể hoặc kết nối đến trình duyệt đang chạy'
  })
  @ApiQuery({
    name: 'profileId',
    description: 'ID của profile người dùng (ví dụ: mrla.0194@gmail.com)',
    required: true,
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Trình duyệt đã được khởi động thành công'
  })
  async settingProfile(@Query('profileId') profileId: string) {
    return this.browserService.settingProfile(profileId);
  }

  @Get('profiles/:profileId/pages')
  @ApiOperation({
    summary: 'Lấy danh sách trang',
    description: 'Lấy danh sách tất cả các trang đang mở trong trình duyệt của profile'
  })
  @ApiParam({
    name: 'profileId',
    description: 'ID của profile người dùng',
    required: true,
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách các trang đang mở',
    type: GetPagesResponseSchema
  })
  async getPages(@Param('profileId') profileId: string) {
    return this.browserService.getPages(profileId);
  }

  @Get('profiles/:profileId/pages/:pageId')
  @ApiOperation({
    summary: 'Lấy thông tin trang',
    description: 'Lấy thông tin chi tiết về một trang cụ thể'
  })
  @ApiParam({
    name: 'profileId',
    description: 'ID của profile người dùng',
    required: true
  })
  @ApiParam({
    name: 'pageId',
    description: 'ID của trang cần thông tin',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết của trang',
    type: PageInfoSchema
  })
  async getPage(@Param('profileId') profileId: string, @Param('pageId') pageId: string) {
    const page = await this.browserService.getPageById(profileId, pageId);

    return this.browserService.pageInfo(page);
  }

  @Post('execute')
  @ApiOperation({
    summary: 'Thực thi các hành động trình duyệt',
    description: `Thực thi một chuỗi hành động trên trình duyệt theo thứ tự.
    
Các hành động có thể là:
${Object.entries(ACTION_DESCRIPTIONS)
  .map(([key, desc]) => `- ${key}: ${desc}`)
  .join('\n')}`
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả của việc thực thi các hành động',
    type: ExecuteActionsResponseSchema
  })
  async executeActions(@Body() dto: BrowserActionDto) {
    const results = [];
    let pageId = dto.pageId;

    for (const action of dto.actions) {
      const result = await this.browserActionService.executeAction(dto.profileId, pageId, action.type, action.params);

      // Cập nhật pageId cho action tiếp theo
      if (!result.success) {
        return {
          success: false,
          results,
          pageId
        };
      }

      pageId = result.pageId ?? pageId;

      results.push({
        type: action.type,
        success: result.success,
        data: result.data,
        error: result.error
      });
    }

    return {
      success: true,
      results,
      pageId
    };
  }

  @Delete('profiles/:profileId/pages/:pageId')
  @ApiOperation({
    summary: 'Đóng trang',
    description: 'Đóng một trang cụ thể trong trình duyệt'
  })
  @ApiParam({
    name: 'profileId',
    description: 'ID của profile người dùng',
    required: true
  })
  @ApiParam({
    name: 'pageId',
    description: 'ID của trang cần đóng',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả của việc đóng trang',
    type: ClosePageResponseSchema
  })
  async closePage(@Param('profileId') profileId: string, @Param('pageId') pageId: string) {
    return this.browserService.closePage(profileId, pageId);
  }
}

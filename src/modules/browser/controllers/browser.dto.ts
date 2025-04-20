import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EBrowserActionType } from '../interfaces/browser.interface';

export class GotoActionParamsDto {
  @ApiProperty({
    description: 'URL để điều hướng đến',
    example: 'https://google.com',
    type: String
  })
  @IsString()
  url: string;
}

export class TypeActionParamsDto {
  @ApiProperty({
    description: 'CSS selector của phần tử để nhập văn bản',
    example: 'input[name="username"]',
    type: String
  })
  @IsString()
  selector: string;

  @ApiProperty({
    description: 'Văn bản để nhập vào',
    example: 'admin@example.com',
    type: String
  })
  @IsString()
  text: string;
}

export class ClickActionParamsDto {
  @ApiProperty({
    description: 'CSS selector của phần tử để nhấp vào',
    example: 'button[type="submit"]',
    type: String
  })
  @IsString()
  selector: string;
}

export class HoverActionParamsDto {
  @ApiProperty({
    description: 'CSS selector của phần tử để di chuột qua',
    example: '.dropdown-menu',
    type: String
  })
  @IsString()
  selector: string;
}

export class PressActionParamsDto {
  @ApiProperty({
    description: 'Phím để nhấn (ví dụ: Enter, Tab, ArrowDown)',
    example: 'Enter',
    type: String
  })
  @IsString()
  key: string;
}

export class WaitForSelectorParamsDto {
  @ApiProperty({
    description: 'CSS selector của phần tử để đợi xuất hiện',
    example: '.loaded-content',
    type: String
  })
  @IsString()
  selector: string;

  @ApiPropertyOptional({
    description: 'Thời gian chờ tối đa (ms)',
    example: 5000,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  timeout?: number;
}

export class GetTextParamsDto {
  @ApiProperty({
    description: 'CSS selector của phần tử để lấy văn bản',
    example: '.article-content',
    type: String
  })
  @IsString()
  selector: string;
}

export class EvaluateActionParamsDto {
  @ApiProperty({
    description: 'Mã JavaScript để thực thi',
    example: 'return document.querySelectorAll(".product").length;',
    type: String
  })
  @IsString()
  script: string;

  @ApiPropertyOptional({
    description: 'Các đối số để truyền vào script',
    example: ['article', 3],
    type: Array
  })
  @IsArray()
  @IsOptional()
  args?: any[];
}

export class ActionDto {
  @ApiProperty({
    enum: EBrowserActionType,
    description: 'Loại hành động',
    example: EBrowserActionType.CLICK,
    enumName: 'EBrowserActionType'
  })
  @IsEnum(EBrowserActionType)
  type: EBrowserActionType;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type((options) => {
    switch (options.object?.type) {
      case EBrowserActionType.GOTO:
        return GotoActionParamsDto;
      case EBrowserActionType.TYPE:
        return TypeActionParamsDto;
      case EBrowserActionType.CLICK:
        return ClickActionParamsDto;
      case EBrowserActionType.HOVER:
        return HoverActionParamsDto;
      case EBrowserActionType.PRESS:
        return PressActionParamsDto;
      case EBrowserActionType.WAIT_FOR_SELECTOR:
        return WaitForSelectorParamsDto;
      case EBrowserActionType.GET_TEXT:
        return GetTextParamsDto;
      case EBrowserActionType.EVALUATE:
        return EvaluateActionParamsDto;
      default:
        return undefined;
    }
  })
  params: any;
}

export class BrowserActionDto {
  @ApiProperty({
    description: 'ID của profile người dùng',
    example: 'user@example.com',
    type: String
  })
  @IsString()
  public profileId: string;

  @ApiPropertyOptional({
    description: 'ID của trang để thực hiện hành động (nếu không có, một trang mới sẽ được tạo)',
    example: 'AB12CD34EF56',
    type: String
  })
  @IsString()
  @IsOptional()
  public pageId: string;

  @ApiProperty({
    type: [ActionDto],
    description: 'Danh sách các hành động để thực thi theo thứ tự',
    example: [
      {
        type: EBrowserActionType.GOTO,
        params: { url: 'https://example.com/login' }
      },
      {
        type: EBrowserActionType.TYPE,
        params: { selector: 'input[name="username"]', text: 'admin@example.com' }
      },
      {
        type: EBrowserActionType.TYPE,
        params: { selector: 'input[name="password"]', text: 'securepassword123' }
      },
      {
        type: EBrowserActionType.CLICK,
        params: { selector: 'button[type="submit"]' }
      },
      {
        type: EBrowserActionType.WAIT_FOR_SELECTOR,
        params: { selector: '.dashboard', timeout: 5000 }
      }
    ]
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ActionDto)
  public actions: ActionDto[];
}

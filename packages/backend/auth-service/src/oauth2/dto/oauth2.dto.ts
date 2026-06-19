import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthorizeDto {
  @ApiProperty({ description: 'Client ID' })
  @IsString()
  client_id: string;

  @ApiProperty({ description: 'Redirect URI' })
  @IsString()
  redirect_uri: string;

  @ApiProperty({ description: 'Response type (code)' })
  @IsString()
  response_type: string;

  @ApiProperty({ description: 'Requested scopes' })
  @IsString()
  scope: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  user_id?: string;
}

export class TokenDto {
  @ApiProperty({ description: 'Grant type (authorization_code, refresh_token)' })
  @IsString()
  grant_type: string;

  @ApiPropertyOptional({ description: 'Authorization code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Refresh token' })
  @IsOptional()
  @IsString()
  refresh_token?: string;

  @ApiPropertyOptional({ description: 'Client secret' })
  @IsOptional()
  @IsString()
  client_secret?: string;

  @ApiPropertyOptional({ description: 'Client ID' })
  @IsOptional()
  @IsString()
  client_id?: string;

  @ApiPropertyOptional({ description: 'Redirect URI' })
  @IsOptional()
  @IsString()
  redirect_uri?: string;
}

export class IntrospectDto {
  @ApiProperty({ description: 'Token to introspect' })
  @IsString()
  token: string;
}

export class RevokeDto {
  @ApiProperty({ description: 'Token to revoke' })
  @IsString()
  token: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  token_type_hint?: string;
}

export class RegisterClientDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  redirect_uris: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  scopes: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  grants: string[];
}

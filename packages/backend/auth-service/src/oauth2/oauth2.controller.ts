import { Controller, Post, Get, Query, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Oauth2Service } from './oauth2.service';
import { AuthorizeDto, TokenDto, IntrospectDto, RevokeDto, RegisterClientDto } from './dto/oauth2.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('OAuth2')
@Controller('oauth2')
export class Oauth2Controller {
  private readonly logger = new Logger(Oauth2Controller.name);

  constructor(private readonly oauth2Service: Oauth2Service) {}

  @Get('authorize')
  @Public()
  @ApiOperation({ summary: 'OAuth2 authorization endpoint' })
  async authorize(@Query() dto: AuthorizeDto) {
    return this.oauth2Service.authorize(
      dto.client_id,
      dto.redirect_uri,
      dto.scope,
      dto.user_id,
    );
  }

  @Post('token')
  @Public()
  @ApiOperation({ summary: 'OAuth2 token endpoint' })
  async token(@Body() dto: TokenDto) {
    return this.oauth2Service.token(
      dto.code!,
      dto.client_secret,
      dto.client_id,
      dto.redirect_uri,
      dto.refresh_token,
    );
  }

  @Post('introspect')
  @Public()
  @ApiOperation({ summary: 'OAuth2 token introspection' })
  async introspect(@Body() dto: IntrospectDto) {
    return this.oauth2Service.introspect(dto.token);
  }

  @Post('revoke')
  @Public()
  @ApiOperation({ summary: 'OAuth2 token revocation' })
  async revoke(@Body() dto: RevokeDto) {
    return this.oauth2Service.revoke(dto.token);
  }

  @Post('clients')
  @Public()
  @ApiOperation({ summary: 'Register a new OAuth2 client' })
  async registerClient(@Body() dto: RegisterClientDto) {
    return this.oauth2Service.registerClient(
      dto.name,
      dto.redirect_uris,
      dto.scopes,
      dto.grants,
    );
  }
}

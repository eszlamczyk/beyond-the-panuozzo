import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard that requires a valid JWT bearer token on the request. */
@Injectable()
export class JwtAuthenticationGuard extends AuthGuard('jwt') {}

export interface CreateRefreshTokenDTO {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface RefreshTokenRequestBodyDTO {
  refreshToken: string;
}

export interface RefreshTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenUseCaseInputDTO {
   refreshToken: string;
}

export interface RefreshTokenUseCaseOutputDTO {
   accessToken: string;
   newRefreshToken: string;
}

export interface LogoutUseCaseInputDTO {
    userId: string;
}

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    class Config:
        env_file = ".env"
    
    database_hostname: str
    database_port: str
    database_password: str
    database_name: str
    database_username: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    backend_cors_origins: str = ""
    
    @property
    def all_cors_origins(self) -> list[str]:
        if not self.backend_cors_origins:
            return []
        return [origin.strip() for origin in self.backend_cors_origins.split(",")]

settings = Settings()
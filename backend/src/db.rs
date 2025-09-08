use sqlx::postgres::PgPoolOptions;
use std::env;

pub async fn create_db_pool() -> Result<sqlx::PgPool, sqlx::Error> {
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
}

require('dotenv').config();

module.exports = {
    "development": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASS,
        "database": process.env.DB_NAME,
        "host": process.env.DB_HOST,
        "dialect": process.env.DB_DIALECT
    },
    "test": {
        "username": process.env.DB_TEST_USER,
        "password": process.env.DB_TEST_PASSWORD,
        "database": process.env.DB_TEST_DATABASE,
        "host": process.env.DB_TEST_HOST,
        "dialect": process.env.DB_TEST_DIALECT
    },
    "production": {
        "username": process.env.DB_PROD_USER,
        "password": process.env.DB_PROD_PASSWORD,
        "database": process.env.DB_PROD_DATABASE,
        "host": process.env.DB_PROD_HOST,
        "dialect": process.env.DB_PROD_DIALECT,
        "dialectOptions": {
            "ssl": {
                "require": process.env.DB_PROD_SSL_REQUIRE === 'true',
                "rejectUnauthorized": process.env.DB_PROD_SSL_REJECT_UNAUTHORIZED === 'true'
            }
        }
    }
};
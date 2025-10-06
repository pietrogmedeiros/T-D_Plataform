/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'plataforma-ted-uploads.s3.us-east-2.amazonaws.com',
      'plataforma-ted-webcontinental-uploads.s3.us-east-2.amazonaws.com',
    ],
  },
  env: {
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    DYNAMODB_USERS_TABLE: process.env.DYNAMODB_USERS_TABLE,
    DYNAMODB_TRAININGS_TABLE: process.env.DYNAMODB_TRAININGS_TABLE,
    DYNAMODB_USER_PROGRESS_TABLE: process.env.DYNAMODB_USER_PROGRESS_TABLE,
    DYNAMODB_TRAINING_RATINGS_TABLE: process.env.DYNAMODB_TRAINING_RATINGS_TABLE,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'your-domain.vercel.app'],
    },
  },
};

export default nextConfig;
import { registerAs } from '@nestjs/config';
export default registerAs('filesystem', () => ({
  default: 'docs',
  disks: {
    docs: {
      driver: 's3',
      bucket: process.env.AWS_S3_DOCS_BUCKET,
      key: process.env.AWS_KEY,
      secret: process.env.AWS_SECRET,
      region: process.env.AWS_REGION,
    },
  },
}));

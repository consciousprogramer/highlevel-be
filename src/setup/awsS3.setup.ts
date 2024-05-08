import aws from "aws-sdk"
const { S3 } = aws

export const bucketName = "ghl-be-bucket"
export const region = "ap-south-1"

const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID!
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY!

const s3Client = new S3({
	region,
	credentials: {
		accessKeyId,
		secretAccessKey,
	},
})

export default s3Client
